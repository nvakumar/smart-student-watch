// ✅ Your public Flask backend (via ngrok)
export const BASE_URL = "https://46ccbd60b15f.ngrok-free.app";

// 🔒 LOGIN
export const loginStudent = async (registration_id: string) => {
  const response = await fetch(`${BASE_URL}/api/login`, {
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
  const response = await fetch(`${BASE_URL}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, reg_id, imagesData }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Registration failed");
  return data;
};

// 🧠 START RECOGNITION (OPTIONAL, NOT USED IN FINAL FLOW)
export const startRecognition = async () => {
  const response = await fetch(`${BASE_URL}/api/start_recognition`, {
    method: "POST",
  });
  return response.json();
};

// 📊 GET REPORTS (Teacher)
export const getStudentReports = async () => {
  const response = await fetch(`${BASE_URL}/api/report`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to fetch reports");
  return data;
};

// 🗑️ DELETE ALL STUDENT DATA
export const deleteAllStudentData = async () => {
  const response = await fetch(`${BASE_URL}/api/delete_all_students`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to delete data");
  return data;
};

// 👁️ CURRENT STUDENTS (for Teacher Dashboard)
export const getCurrentStudents = async () => {
  const response = await fetch(`${BASE_URL}/api/students`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to fetch students");
  return data;
};

// 🧠 LIVE STATUS (Student Dashboard – Not implemented in backend yet)
export const getMonitoringStatus = async (registration_id: string) => {
  const response = await fetch(`${BASE_URL}/api/monitoring_status?registration_id=${registration_id}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to fetch monitoring status");
  return data;
};
