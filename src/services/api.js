import axios from "axios";

// 🔥 Your real backend
const API_BASE_URL = "https://attendance-7o64.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const qrLogin = async (qrCodeId, location) => {
  try {
    const response = await api.post("/auth/qr-login", {
      qrCodeId,
      lat: location?.lat,
      lng: location?.lng,
    });

    return response.data; // { token, user }
  } catch (error) {
    console.error("QR Login Error:", error);
    throw error.response?.data || { message: "Login failed" };
  }
};

export default api;
