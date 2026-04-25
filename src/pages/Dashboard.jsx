import { useEffect, useState, useRef } from "react";
import WorkModal from "../components/WorkModal";
import { checkIn, checkOut, getTodayStatus, getCurrentLocation } from "../services/api";
export default function Dashboard() {
  const [mode, setMode] = useState("office"); // office | outside
  const [checkedIn, setCheckedIn] = useState(false);
  const [time, setTime] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [expiresAt, setExpiresAt] = useState(null);
  const [duration, setDuration] = useState("0h 0m");
  const pollingRef = useRef(null);
  const tickRef = useRef(null);
  const handleCheckIn = async () => {
    try {
      const loc = await getCurrentLocation();

      const user = JSON.parse(localStorage.getItem("user"));

      const res = await checkIn({
        lat: loc.lat,
        lng: loc.lng,
        status: mode,
        employeeId: user?.employeeId,
      });

      // response: { message, data: rec }
      const rec = res && res.data ? res.data : res;

      const checkInTime = rec?.checkInTime ? new Date(rec.checkInTime) : new Date();
      const nowStr = checkInTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      const exp = new Date(checkInTime.getTime() + 15 * 60 * 60 * 1000);

      setCheckedIn(true);
      setTime(nowStr);
      setExpiresAt(exp);

      // persist fallback so UI remains even if offline/logout
      try {
        localStorage.setItem(
          "attendance_session",
          JSON.stringify({ checkInTime: checkInTime.toISOString(), expiresAt: exp.toISOString() }),
        );
      } catch (e) {}
    } catch (err) {
      alert(err?.message || err?.response?.data?.message || "Check-in failed");
    }
  };
  const getLocation = () =>
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
  useEffect(() => {
    let mounted = true;

    async function loadStatus() {
      try {
        const data = await getTodayStatus();

        if (!mounted) return;

        if (data.status === "checked_in") {
          setCheckedIn(true);
          const ci = new Date(data.checkInTime);
          setTime(ci.toLocaleTimeString());

          if (data.expiresAt) setExpiresAt(new Date(data.expiresAt));
          else setExpiresAt(new Date(ci.getTime() + 15 * 60 * 60 * 1000));
        } else if (data.status === "completed") {
          setCheckedIn(false);
          setTime(null);
          setExpiresAt(null);
          localStorage.removeItem("attendance_session");
        } else {
          // not checked in
          setCheckedIn(false);
          setTime(null);
          setExpiresAt(null);
        }
      } catch (e) {
        // fallback: if localStorage has session, use it
        try {
          const sess = JSON.parse(localStorage.getItem("attendance_session"));
          if (sess && sess.checkInTime) {
            const ci = new Date(sess.checkInTime);
            setCheckedIn(true);
            setTime(ci.toLocaleTimeString());
            setExpiresAt(sess.expiresAt ? new Date(sess.expiresAt) : new Date(ci.getTime() + 15 * 60 * 60 * 1000));
          }
        } catch (err) {}
      }
    }

    loadStatus();

    // poll every 30 seconds to sync (also picks up auto-checkout)
    pollingRef.current = setInterval(loadStatus, 30000);

    // tick every second to update duration/countdown
    tickRef.current = setInterval(() => {
      setDuration((prev) => {
        return prev; // trigger render
      });
    }, 1000);

    return () => {
      mounted = false;
      clearInterval(pollingRef.current);
      clearInterval(tickRef.current);
    };
  }, []);

  // compute human-readable duration and countdown
  useEffect(() => {
    const update = () => {
      if (!checkedIn) {
        setDuration("0h 0m");
        return;
      }

      const ciStr = localStorage.getItem("attendance_session");
      let ci = null;
      if (ciStr) {
        try {
          const obj = JSON.parse(ciStr);
          if (obj && obj.checkInTime) ci = new Date(obj.checkInTime);
        } catch (e) {}
      }

      // prefer server time: derive from `time` state if available
      let start = ci || (time ? new Date() : new Date());
      if (time && !ci) {
        // reconstruct start from `time` (best-effort)
        start = new Date();
      }

      const now = new Date();
      if (start) {
        const diffMs = now - start;
        const hrs = Math.floor(diffMs / (1000 * 60 * 60));
        const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        setDuration(`${hrs}h ${mins}m`);
      }
    };

    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [checkedIn, time, expiresAt]);
  const handleCheckout = async (description) => {
    try {
      const loc = await getLocation();

      const user = JSON.parse(localStorage.getItem("user"));

      await checkOut({
        description,
        lat: loc.lat,
        lng: loc.lng,
        employeeId: user?.employeeId, // ✅ ADD THIS
      });

      setCheckedIn(false);
      setTime(null);
      setShowModal(false);
    } catch (err) {
      alert(err?.response?.data?.message || "Checkout failed");
    }
  };
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">AttendX</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm">Gyana</span>
          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm">
            GS
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b mb-4">
        <button className="border-b-2 border-blue-500 pb-1 text-blue-500">
          Check-in
        </button>
        <button className="text-gray-500">History</button>
        <button className="text-gray-500">Leave</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 text-center mb-4">
        <div>
          <h2 className="text-xl font-bold">18</h2>
          <p className="text-xs text-gray-500">Days this month</p>
        </div>
        <div>
          <h2 className="text-xl font-bold">143h</h2>
          <p className="text-xs text-gray-500">Hours worked</p>
        </div>
        <div>
          <h2 className="text-xl font-bold">2</h2>
          <p className="text-xs text-gray-500">WFH days</p>
        </div>
      </div>

      {/* Toggle */}
      <div className="bg-white p-3 rounded-xl shadow mb-4 flex justify-between items-center">
        <span className="text-sm text-gray-600">Simulate location:</span>
        <div className="flex bg-gray-100 rounded-full p-1">
          <button
            onClick={() => setMode("office")}
            className={`px-3 py-1 rounded-full text-sm ${
              mode === "office" ? "bg-green-200" : ""
            }`}
          >
            Office
          </button>
          <button
            onClick={() => setMode("outside")}
            className={`px-3 py-1 rounded-full text-sm ${
              mode === "outside" ? "bg-orange-200" : ""
            }`}
          >
            Outside
          </button>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl shadow p-6 text-center">
        {/* Icon */}
        <div className="w-24 h-24 mx-auto rounded-full border-2 border-green-500 flex items-center justify-center mb-4">
          📍
        </div>

        {!checkedIn ? (
          <>
            <p className="text-gray-500 text-sm">Detected location</p>
            <h2 className="text-lg font-semibold mb-4">
              {mode === "office"
                ? "Office — within 5m radius"
                : "Home / Remote — 2.3km away"}
            </h2>

            <button
              onClick={handleCheckIn}
              className="w-full bg-blue-600 text-white py-2 rounded-lg"
            >
              Check in
            </button>
          </>
        ) : (
          <>
            <p className="text-gray-500 text-sm">Detected location</p>
            <h2 className="text-lg font-semibold mb-4">Checked in — {time}</h2>

            <div className="mb-2 text-sm text-gray-600">
              {expiresAt ? (
                <span>
                  Auto checkout at {new Date(expiresAt).toLocaleTimeString()} ({Math.max(0, Math.floor((new Date(expiresAt) - new Date()) / 60000))}m left)
                </span>
              ) : (
                <span>Session active</span>
              )}
            </div>

            <button className="w-full bg-gray-300 text-gray-600 py-2 rounded-lg">
              Checked in
            </button>
          </>
        )}
      </div>

      {/* Session */}
      {checkedIn && (
        <div className="bg-white rounded-xl shadow p-4 mt-4">
          <h3 className="font-semibold mb-3">Today's session</h3>

          <div className="flex justify-between text-sm mb-1">
            <span>Check-in</span>
            <span>{time}</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span>Check-out</span>
            <span>—</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span>Duration</span>
            <span>0h 0m</span>
          </div>

          <button
            onClick={() => setShowModal(true)} // ✅ OPEN MODAL
            className="w-full mt-3 border py-2 rounded-lg"
          >
            Check out
          </button>
        </div>
      )}
      <WorkModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onCheckout={handleCheckout} // ✅ ADD THIS
      />
    </div>
  );
}
