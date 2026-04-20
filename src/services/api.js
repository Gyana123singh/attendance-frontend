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
    // Ensure a persistent deviceId for device-binding on the backend
    let deviceId = localStorage.getItem("deviceId");
    if (!deviceId && typeof crypto !== "undefined" && crypto.randomUUID) {
      deviceId = crypto.randomUUID();
      localStorage.setItem("deviceId", deviceId);
    } else if (!deviceId) {
      deviceId = `dev-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      localStorage.setItem("deviceId", deviceId);
    }

    // Detect if the scanned payload is a JWT (three parts)
    const payloadIsJwt = typeof qrCodeId === "string" && qrCodeId.split(".").length === 3;

    const body = {
      lat: location?.lat,
      lng: location?.lng,
      deviceId,
    };

    if (payloadIsJwt) body.token = qrCodeId;
    else body.qrCodeId = qrCodeId;

    const response = await api.post("/auth/qr-login", body);

    return response.data; // { token, user }
  } catch (error) {
    console.error("QR Login Error:", error?.response || error);
    const err = error?.response?.data || { message: error.message || "Login failed" };
    throw err;
  }
};

export default api;
