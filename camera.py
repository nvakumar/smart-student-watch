import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

import cv2
import mediapipe as mp
import numpy as np
import time
import threading
import pyttsx3
import queue
from tensorflow.keras.models import load_model
import face_recognition
from datetime import datetime
import csv
import glob

# --- Shared data for currently detected students ---
current_students = set()
lock = threading.Lock()

# --- Text-to-Speech Setup ---
engine = pyttsx3.init()
speech_queue = queue.Queue()

def speech_worker():
    while True:
        text = speech_queue.get()
        if text is None:
            break
        engine.say(text)
        engine.runAndWait()
        speech_queue.task_done()

speech_thread = threading.Thread(target=speech_worker, daemon=True)
speech_thread.start()

# --- Load Emotion Detection Model ---
model = load_model("models/best_mobilenet_model.h5")
class_names = ['Angry', 'Disgust', 'Fear', 'Happy', 'Neutral', 'Sad', 'Surprise']
IMG_SIZE = 160

# --- MediaPipe Setup ---
mp_pose = mp.solutions.pose
mp_face = mp.solutions.face_mesh
pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)
face_mesh = mp_face.FaceMesh(max_num_faces=10, refine_landmarks=True,
                             min_detection_confidence=0.5, min_tracking_confidence=0.5)
mp_draw = mp.solutions.drawing_utils

# --- Constants ---
POSTURE_THRESHOLD = 0.08
INA_ATTENTION_THRESHOLD = 0.20
EYE_AR_THRESH = 0.25
ALERT_COOLDOWN = 5
LOG_INTERVAL = 60  # seconds

# --- Eye Aspect Ratio ---
def eye_aspect_ratio(landmarks, left=True):
    points = [33, 160, 158, 133, 153, 144] if left else [362, 385, 387, 263, 373, 380]
    p = [(landmarks.landmark[i].x, landmarks.landmark[i].y) for i in points]
    A = np.linalg.norm(np.array(p[1]) - np.array(p[5]))
    B = np.linalg.norm(np.array(p[2]) - np.array(p[4]))
    C = np.linalg.norm(np.array(p[0]) - np.array(p[3]))
    return (A + B) / (2.0 * C)

# --- Global known face encodings and IDs ---
known_encodings = []
known_ids = []

def load_known_encodings():
    global known_encodings, known_ids
    known_encodings = []
    known_ids = []

    face_dir = "face_data"
    if not os.path.exists(face_dir):
        print(f"Warning: face_data directory '{face_dir}' does not exist.")
        return

    for student_folder in os.listdir(face_dir):
        folder_path = os.path.join(face_dir, student_folder)
        if os.path.isdir(folder_path):
            npy_path = os.path.join(folder_path, f"{student_folder}_encoding.npy")
            if os.path.exists(npy_path):
                encoding = np.load(npy_path)
                known_encodings.append(encoding)
                reg_id = student_folder.split('_')[0]
                known_ids.append(reg_id)
            else:
                image_paths = glob.glob(os.path.join(folder_path, "*.jpg"))
                for img_path in image_paths:
                    img = face_recognition.load_image_file(img_path)
                    encodings = face_recognition.face_encodings(img)
                    if encodings:
                        known_encodings.append(encodings[0])
                        reg_id = student_folder.split('_')[0]
                        known_ids.append(reg_id)

    print(f"Loaded {len(known_encodings)} face encodings for {len(set(known_ids))} students.")

# Load encodings initially on import
load_known_encodings()

# --- Face recognition ---
def recognize_face(face_encoding, known_encodings, known_ids, tolerance=0.5):
    matches = face_recognition.compare_faces(known_encodings, face_encoding, tolerance=tolerance)
    face_distances = face_recognition.face_distance(known_encodings, face_encoding)

    if True in matches:
        matched_idxs = [i for i, match in enumerate(matches) if match]
        best_match_idx = min(matched_idxs, key=lambda i: face_distances[i])
        return known_ids[best_match_idx]
    else:
        return None

# --- Track Student Data ---
attendance_marked = set()
last_alert_time = {}
last_log_time = {}

REPORT_FOLDER = "reports"
os.makedirs(REPORT_FOLDER, exist_ok=True)

def gen_frames_multi():
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open webcam 0")
        return

    while True:
        success, frame = cap.read()
        if not success:
            break

        small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
        rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        face_locations = face_recognition.face_locations(rgb_small_frame)
        face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)

        with lock:
            current_students.clear()

        for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
            top *= 4
            right *= 4
            bottom *= 4
            left *= 4

            student_id = recognize_face(face_encoding, known_encodings, known_ids)
            if student_id is not None:
                with lock:
                    current_students.add(student_id)

                if student_id not in attendance_marked:
                    attendance_marked.add(student_id)
                    with open('student_log.csv', 'a', newline='') as file:
                        writer = csv.writer(file)
                        writer.writerow([datetime.now(), student_id, "Attendance Marked"])
                    speech_queue.put(f"{student_id} attendance marked")

                # Emotion detection
                face_roi = frame[top:bottom, left:right]
                if face_roi.size > 0:
                    try:
                        face_resized = cv2.resize(face_roi, (IMG_SIZE, IMG_SIZE))
                        face_norm = face_resized.astype("float32") / 255.0
                        face_input = np.expand_dims(face_norm, axis=0)
                        preds = model.predict(face_input, verbose=0)
                        class_index = np.argmax(preds)
                        emotion_label = class_names[class_index]
                        confidence = preds[0][class_index]
                    except Exception:
                        emotion_label = "Unknown"
                        confidence = 0.0
                else:
                    emotion_label = "No Face"
                    confidence = 0.0

                # Pose detection
                results_pose = pose.process(frame_rgb)
                posture_status = "Good"
                if results_pose.pose_landmarks:
                    landmarks = results_pose.pose_landmarks.landmark
                    head_y = landmarks[0].y
                    shoulder_y = (landmarks[11].y + landmarks[12].y) / 2
                    if head_y - shoulder_y > POSTURE_THRESHOLD:
                        posture_status = "Slouching"
                    mp_draw.draw_landmarks(frame, results_pose.pose_landmarks, mp_pose.POSE_CONNECTIONS)

                # Eye & attention detection
                results_face = face_mesh.process(frame_rgb)
                eye_status = "Open"
                attention_status = "Focused"
                if results_face.multi_face_landmarks:
                    for face_landmarks in results_face.multi_face_landmarks:
                        mp_draw.draw_landmarks(frame, face_landmarks, mp_face.FACEMESH_CONTOURS)
                        nose_tip = face_landmarks.landmark[1]
                        if abs(nose_tip.x - 0.5) > INA_ATTENTION_THRESHOLD:
                            attention_status = "Inattentive"
                        ear_left = eye_aspect_ratio(face_landmarks, True)
                        ear_right = eye_aspect_ratio(face_landmarks, False)
                        if (ear_left + ear_right) / 2 < EYE_AR_THRESH:
                            eye_status = "Closed"

                # Overlay info
                label = f"{student_id}"
                cv2.rectangle(frame, (left, top), (right, bottom), (255, 255, 0), 2)
                cv2.putText(frame, label, (left, top - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 0), 2)
                cv2.putText(frame, f"Emotion: {emotion_label} ({confidence:.2f})", (30, 50),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
                cv2.putText(frame, f"Posture: {posture_status}", (30, 80),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0) if posture_status == "Good" else (0, 0, 255), 2)
                cv2.putText(frame, f"Eyes: {eye_status} | Attention: {attention_status}", (30, 110),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2)

                # Alerts
                current_time = time.time()
                if posture_status != "Good" or eye_status != "Open" or attention_status != "Focused":
                    if student_id not in last_alert_time or current_time - last_alert_time[student_id] > ALERT_COOLDOWN:
                        speech_queue.put(f"Alert for {student_id}: {posture_status}, {eye_status}, {attention_status}")
                        last_alert_time[student_id] = current_time

                # Logging every minute
                if student_id not in last_log_time or current_time - last_log_time[student_id] > LOG_INTERVAL:
                    log_path = os.path.join(REPORT_FOLDER, f"{student_id}.csv")
                    with open(log_path, 'a', newline='') as f:
                        writer = csv.writer(f)
                        writer.writerow([datetime.now(), emotion_label, f"{confidence:.2f}", posture_status,
                                         eye_status, attention_status])
                    last_log_time[student_id] = current_time

        ret, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

    cap.release()
    speech_queue.put(None)

# --- Teacher camera feed generator ---
def gen_frames_teacher():
    cap = cv2.VideoCapture(1)  # Change if your teacher camera index is different
    if not cap.isOpened():
        print("Error: Could not open teacher webcam 1")
        return

    while True:
        success, frame = cap.read()
        if not success:
            break

        cv2.putText(frame, "Teacher Camera Feed", (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

        ret, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

    cap.release()
    speech_queue.put(None)