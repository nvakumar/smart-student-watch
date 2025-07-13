from flask import Flask, render_template, Response, request, redirect, url_for, session, jsonify, send_from_directory
import os
import cv2
import face_recognition
import base64
import numpy as np
from datetime import datetime
import csv
from camera import gen_frames_multi, current_students, lock

app = Flask(__name__)
app.secret_key = 'f0f261ac34acf09e05a63b0fac7613620ed96baf591b530fe3123937d2f4ffae'

UPLOAD_FOLDER = 'face_data'
REPORT_FOLDER = 'reports'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(REPORT_FOLDER, exist_ok=True)

# ---------------- HOME ---------------- #
@app.route('/')
def home():
    return render_template('home.html')

# ---------------- TEACHER DASHBOARD ---------------- #
@app.route('/teacher_dashboard')
def teacher_dashboard():
    return render_template('teacher.html')

def gen_frames_teacher():
    cap = cv2.VideoCapture(0)
    while True:
        success, frame = cap.read()
        if not success:
            break
        ret, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
    cap.release()

@app.route('/teacher_video_feed')
def teacher_video_feed():
    return Response(gen_frames_teacher(), mimetype='multipart/x-mixed-replace; boundary=frame')

# ---------------- REGISTRATION ---------------- #
@app.route('/register', methods=['GET'])
def register_page():
    return render_template('register.html')

@app.route('/register', methods=['POST'])
def register_student():
    data = request.get_json(force=True)
    try:
        name = ''.join(c for c in data['name'] if c.isalnum() or c in (' ', '_'))
        reg_id = data['reg_id']
        images_data = data['imagesData']  # List of base64 images

        all_encodings = []
        saved_filenames = []

        student_folder = os.path.join(UPLOAD_FOLDER, f"{reg_id}_{name}")
        os.makedirs(student_folder, exist_ok=True)

        for idx, image_data in enumerate(images_data):
            try:
                encoded_data = image_data.split(',')[1]
                nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

                filename = f"{reg_id}_{name}_{idx}.jpg"
                filepath = os.path.join(student_folder, filename)
                cv2.imwrite(filepath, img)
                saved_filenames.append(filepath)

                image = face_recognition.load_image_file(filepath)
                encodings = face_recognition.face_encodings(image)
                if encodings:
                    all_encodings.append(encodings[0])
            except Exception as e:
                print(f"Error processing image {idx}: {e}")

        if not all_encodings:
            for f in saved_filenames:
                os.remove(f)
            os.rmdir(student_folder)
            return jsonify({"message": "No faces detected in any image. Please try again."}), 400

        avg_encoding = np.mean(all_encodings, axis=0)
        encoding_path = os.path.join(student_folder, f"{reg_id}_{name}_encoding.npy")
        np.save(encoding_path, avg_encoding)

        with open('student_log.csv', 'a', newline='') as file:
            writer = csv.writer(file)
            writer.writerow([datetime.now().strftime('%Y-%m-%d %H:%M:%S'), reg_id, name, "REGISTERED"])

        return jsonify({"message": "Registration successful with multiple face patterns!"})

    except Exception as e:
        return jsonify({"message": f"Registration failed: {e}"}), 500

# ---------------- LOGIN ---------------- #
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        reg_id = request.form.get('reg_id')
        if reg_id:
            session['reg_id'] = reg_id
            return redirect(url_for('dashboard'))
        return render_template('login.html', error="Please enter registration ID.")
    return render_template('login.html')

# ---------------- DASHBOARD ---------------- #
@app.route('/dashboard')
def dashboard():
    if 'reg_id' not in session:
        return redirect(url_for('login'))
    return render_template('dashboard.html')

@app.route('/video_feed_multi')
def video_feed_multi():
    if 'reg_id' not in session:
        return redirect(url_for('login'))
    return Response(gen_frames_multi(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/get_current_students')
def get_current_students():
    with lock:
        return jsonify({k: v for k, v in current_students.items()})

# ---------------- REPORTS ---------------- #
@app.route('/report/<student_id>')
def report(student_id):
    file_path = os.path.join(REPORT_FOLDER, f'{student_id}.csv')
    if not os.path.exists(file_path):
        return f"No report found for student ID: {student_id}", 404

    with open(file_path, 'r') as file:
        reader = csv.reader(file)
        report_data = list(reader)

    return render_template('report.html', student_id=student_id, report_data=report_data)

@app.route('/get_reports')
def get_reports():
    reports = []
    try:
        for filename in os.listdir(REPORT_FOLDER):
            if filename.endswith('.csv'):
                url = url_for('serve_report', filename=filename)
                reports.append({'name': filename, 'url': url})
    except Exception as e:
        print("Error reading reports folder:", e)
    return jsonify({'reports': reports})

@app.route('/reports/<path:filename>')
def serve_report(filename):
    return send_from_directory(REPORT_FOLDER, filename)

# ---------------- DELETION ---------------- #
@app.route('/delete_all_students', methods=['POST'])
def delete_all_students():
    try:
        for subdir in os.listdir(UPLOAD_FOLDER):
            full_path = os.path.join(UPLOAD_FOLDER, subdir)
            if os.path.isdir(full_path):
                for f in os.listdir(full_path):
                    os.remove(os.path.join(full_path, f))
                os.rmdir(full_path)

        with open('student_log.csv', 'w') as f:
            f.write('')

        return jsonify({"message": "All student data deleted successfully."})
    except Exception as e:
        return jsonify({"message": f"Failed to delete student data: {e}"}), 500



# ---------------- LOGOUT ---------------- #
@app.route('/logout')
def logout():
    session.pop('reg_id', None)
    return redirect(url_for('home'))

# ---------------- MAIN ---------------- #
if __name__ == '__main__':
    app.run(debug=True)
