import axios from "axios";

// ✅ AUTO DETECT ENVIRONMENT
const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:4000/api"
    : "https://attendance-7o64.onrender.com/api";

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

// =====================================================
// 🔐 AUTH APIs
// =====================================================

// ✅ Normal Login
export const login = async (email, password) => {
  try {
    const res = await api.post("/auth/login", { email, password });

    // save token
    localStorage.setItem("token", res.data.token);

    return res.data; // { token, user }
  } catch (error) {
    throw error?.response?.data || { message: "Login failed" };
  }
};

// ✅ Get logged-in user
export const getMe = async () => {
  try {
    const res = await api.get("/auth/me");
    return res.data;
  } catch (error) {
    throw error?.response?.data || { message: "Fetch user failed" };
  }
};

// =====================================================
// 📷 QR LOGIN (YOUR EXISTING - IMPROVED)
// =====================================================

export const qrLogin = async (qrCodeId, location) => {
  try {
    let deviceId = localStorage.getItem("deviceId");

    if (!deviceId && typeof crypto !== "undefined" && crypto.randomUUID) {
      deviceId = crypto.randomUUID();
    } else if (!deviceId) {
      deviceId = `dev-${Date.now()}-${Math.random()}`;
    }

    localStorage.setItem("deviceId", deviceId);

    const payloadIsJwt =
      typeof qrCodeId === "string" && qrCodeId.split(".").length === 3;

    const body = {
      lat: location?.lat,
      lng: location?.lng,
      deviceId,
    };

    if (payloadIsJwt) body.token = qrCodeId;
    else body.qrCodeId = qrCodeId;

    const res = await api.post("/auth/qr-login", body);

    // save token
    localStorage.setItem("token", res.data.token);

    return res.data;
  } catch (error) {
    console.error("QR Login Error:", error?.response || error);
    throw error?.response?.data || { message: "QR Login failed" };
  }
};

// =====================================================
// 📍 ATTENDANCE APIs
// =====================================================

// ✅ Get today status
export const getTodayStatus = async () => {
  try {
    const res = await api.get("/attendance/today-status");
    return res.data;
  } catch (error) {
    throw error?.response?.data || { message: "Status fetch failed" };
  }
};

// ✅ Check-in
export const checkIn = async ({ lat, lng, status }) => {
  try {
    const res = await api.post("/attendance/checkin", {
      lat,
      lng,
      status, // "office" | "outside"
    });
    return res.data;
  } catch (error) {
    throw error?.response?.data || { message: "Check-in failed" };
  }
};

// ✅ Check-out
export const checkOut = async ({ description, lat, lng }) => {
  try {
    const res = await api.post("/attendance/checkout", {
      description,
      lat,
      lng,
    });
    return res.data;
  } catch (error) {
    throw error?.response?.data || { message: "Check-out failed" };
  }
};

// ✅ Attendance history
export const getAttendanceHistory = async (month, year) => {
  try {
    const res = await api.get(`/attendance/history?month=${month}&year=${year}`);
    return res.data;
  } catch (error) {
    throw error?.response?.data || { message: "History fetch failed" };
  }
};

// ✅ Update attendance description
export const updateAttendanceDescription = async (id, description) => {
  try {
    const res = await api.put(`/attendance/${id}/description`, { description });
    return res.data;
  } catch (error) {
    throw error?.response?.data || { message: "Failed to update description" };
  }
};

// ✅ Export attendance excel
export const exportAttendanceExcel = async (month, year) => {
  try {
    const res = await api.get(`/attendance/export-excel?month=${month}&year=${year}`, {
      responseType: 'blob',
    });
    return res.data;
  } catch (error) {
    throw error?.response?.data || { message: "Export failed" };
  }
};

// =====================================================
// 🏖️ LEAVE APIs
// =====================================================

// ✅ Create leave request
export const createLeave = async (leaveData) => {
  try {
    const res = await api.post("/leaves/create/leave", leaveData);
    return res.data;
  } catch (error) {
    throw error?.response?.data || { message: "Leave request failed" };
  }
};

// ✅ Get logged-in user's leaves
export const getMyLeaves = async () => {
  try {
    const res = await api.get("/leaves/my-leaves");
    return res.data;
  } catch (error) {
    throw error?.response?.data || { message: "Fetch leaves failed" };
  }
};

// ✅ Get leave balance
export const getLeaveBalance = async () => {
  try {
    const res = await api.get("/leaves/balance");
    return res.data;
  } catch (error) {
    throw error?.response?.data || { message: "Fetch leave balance failed" };
  }
};

// =====================================================
// 📍 LOCATION HELPER
// =====================================================

export const getCurrentLocation = () =>
  new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      reject,
    );
  });

export default api;
