const BASE_URL = "http://192.168.0.194:5050"; // Your backend IP

export const registerStudent = async () => {
  const res = await fetch(`${BASE_URL}/register`, { method: "POST" });
  return res.json();
};

export const startRecognition = async () => {
  const res = await fetch(`${BASE_URL}/start_recognition`, { method: "POST" });
  return res.json();
};

export const getReport = async () => {
  const res = await fetch(`${BASE_URL}/report`);
  return res.json();
};
