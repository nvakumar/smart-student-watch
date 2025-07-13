const BASE_URL = "http://192.168.0.194:5050"; // Update if IP changes

// 🔒 LOGIN
export const loginStudent = async (registration_id: string) => {
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ registration_id }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Login failed");
  return data;
};

// 📝 REGISTER
export const registerStudent = async (name: string, reg_id: string, imagesData: string[]) => {
  const response = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, reg_id, imagesData }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Registration failed");
  return data;
};

// 🧠 START RECOGNITION
export const startRecognition = async () => {
  const response = await fetch(`${BASE_URL}/start_recognition`, {
    method: "POST",
  });
  return response.json();
};

// 📊 GET REPORTS (Teacher)
export const getStudentReports = async () => {
  const response = await fetch(`${BASE_URL}/get_reports`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to fetch reports");
  return data;
};

// 🗑️ DELETE ALL STUDENT DATA
export const deleteAllStudentData = async () => {
  const response = await fetch(`${BASE_URL}/delete_all_students`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to delete data");
  return data;
};

// 📽️ GET CURRENT STUDENTS (Teacher Dashboard)
export const getCurrentStudents = async () => {
  const response = await fetch(`${BASE_URL}/get_current_students`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to fetch students");
  return data;
};

// 📡 GET LIVE MONITORING STATUS (Student Dashboard)
export const getMonitoringStatus = async (registration_id: string) => {
  const response = await fetch(`${BASE_URL}/monitoring_status?registration_id=${registration_id}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to fetch monitoring status");
  return data;
};
