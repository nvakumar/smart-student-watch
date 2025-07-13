import cv2
import face_recognition
import os
import numpy as np
from tensorflow.keras.models import load_model
from reportlab.pdfgen import canvas
from datetime import datetime
import time

# Load emotion model
model = load_model("models/best_mobilenet_model.h5")
class_names = ['Angry', 'Disgust', 'Fear', 'Happy', 'Neutral', 'Sad', 'Surprise']

# Load known face encodings
known_face_encodings = []
known_face_names = []

for file in os.listdir("known_faces"):
    if file.endswith(('.jpg', '.png')):
        image = face_recognition.load_image_file(f"known_faces/{file}")
        encoding = face_recognition.face_encodings(image)
        if encoding:
            known_face_encodings.append(encoding[0])
            known_face_names.append(os.path.splitext(file)[0])

# Initialize video
cap = cv2.VideoCapture(0)

# Trackers
recognized_name = "Unknown"
emotion_log = []
posture_count = 0
attention_count = 0
start_time = time.time()
DURATION = 60  # seconds

while True:
    ret, frame = cap.read()
    if not ret:
        break

    small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
    rgb_small = small_frame[:, :, ::-1]

    # Face recognition
    face_locations = face_recognition.face_locations(rgb_small)
    face_encodings = face_recognition.face_encodings(rgb_small, face_locations)

    for face_encoding in face_encodings:
        matches = face_recognition.compare_faces(known_face_encodings, face_encoding)
        face_dist = face_recognition.face_distance(known_face_encodings, face_encoding)
        best_match_index = np.argmin(face_dist)

        if matches[best_match_index]:
            recognized_name = known_face_names[best_match_index]

    # Emotion detection
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)

    for (x, y, w_f, h_f) in faces:
        face_roi = frame[y:y + h_f, x:x + w_f]
        face_resized = cv2.resize(face_roi, (160, 160))
        face_norm = face_resized.astype("float32") / 255.0
        face_input = np.expand_dims(face_norm, axis=0)

        preds = model.predict(face_input, verbose=0)
        label = class_names[np.argmax(preds)]
        emotion_log.append(label)
        break  # Only use one face

    # Dummy posture/attention (replace with actual logic)
    posture_count += np.random.choice([0, 1], p=[0.8, 0.2])  # 20% chance bad
    attention_count += np.random.choice([0, 1], p=[0.9, 0.1])  # 10% chance inattentive

    # End condition
    if time.time() - start_time > DURATION:
        break

cap.release()

# ---------------------
# Report Generation
# ---------------------
os.makedirs("reports", exist_ok=True)
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
report_path = f"reports/{recognized_name}_{timestamp}.pdf"

c = canvas.Canvas(report_path)
c.setFont("Helvetica", 20)
c.drawString(100, 800, f"Student Engagement Report")
c.setFont("Helvetica", 14)
c.drawString(100, 770, f"Name: {recognized_name}")
c.drawString(100, 750, f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

# Emotion summary
from collections import Counter
emotion_summary = Counter(emotion_log).most_common(3)
c.drawString(100, 710, "Top Emotions:")
for i, (emo, count) in enumerate(emotion_summary):
    c.drawString(120, 690 - i*20, f"{emo}: {count} times")

# Posture & attention
c.drawString(100, 620, f"Slouching Alerts: {posture_count}")
c.drawString(100, 600, f"Inattention Alerts: {attention_count}")

# Suggestions
c.setFont("Helvetica-Bold", 14)
c.drawString(100, 550, "Suggestions:")
c.setFont("Helvetica", 12)
if posture_count > 5:
    c.drawString(120, 530, "- Maintain better sitting posture.")
if attention_count > 3:
    c.drawString(120, 510, "- Stay focused during the session.")
if emotion_summary and emotion_summary[0][0] in ['Sad', 'Angry', 'Fear']:
    c.drawString(120, 490, "- Try to stay positive and take breaks if needed.")

c.save()

print(f"[INFO] Report saved to: {report_path}")
