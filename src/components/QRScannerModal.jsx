import { useState, useRef, useEffect } from "react";
import { X, Loader2, Camera, AlertCircle } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { qrLogin } from "../services/api";
import { useNavigate } from "react-router-dom";

const QRScannerModal = ({ isOpen, onClose }) => {
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scannerRef = useRef(null);
  const navigate = useNavigate();
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);

  useEffect(() => {
    if (isOpen && !scannerRef.current) {
      startScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const startScanner = async (cameraIdParam) => {
    try {
      setScanning(true);
      setError("");

      const devices = await Html5Qrcode.getCameras();

      if (!devices || devices.length === 0) {
        throw new Error("No camera found");
      }

      setCameras(devices);

      // ✅ Prefer rear camera
      const backCamera = devices.find((d) =>
        d.label.toLowerCase().includes("back"),
      );

      const cameraId = cameraIdParam || backCamera?.id || devices[0].id;
      setSelectedCamera(cameraId);

      const html5QrCode = new Html5Qrcode("qr-scanner");
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        cameraId,
        {
          fps: 10,
          qrbox: 250,
        },
        onScanSuccess,
      );
    } catch (err) {
      console.error("Camera Error:", err);
      setError("Camera not working on this device.");
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch (e) {}
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const onScanSuccess = async (decodedText) => {
    try {
      if (loading) return;

      setLoading(true);
      setError("");

      let qrCodeId;
      try {
        const data = JSON.parse(decodedText);
        qrCodeId = data.qrCodeId;
      } catch {
        qrCodeId = decodedText;
      }

      // 📍 Location
      let location = {};
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
      } catch {}

      const { token } = await qrLogin(qrCodeId, location);

      if (!token) throw new Error("Invalid response");

      localStorage.setItem("token", token);

      await stopScanner();
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.message || "Scan failed");
      setLoading(false);
    }
  };

  const handleCameraChange = async (cameraId) => {
    await stopScanner();
    startScanner(cameraId);
  };

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/90 rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Camera className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold">Scan QR Code</h2>
          </div>
          <button onClick={handleClose}>
            <X />
          </button>
        </div>

        {/* Scanner Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          {/* ✅ Camera Selector */}
          {cameras.length > 1 && (
            <select
              value={selectedCamera || ""}
              onChange={(e) => handleCameraChange(e.target.value)}
              className="mb-4 p-2 border rounded-lg w-full max-w-xs"
            >
              {cameras.map((cam, index) => (
                <option key={cam.id} value={cam.id}>
                  {cam.label?.toLowerCase().includes("back")
                    ? "Rear Camera"
                    : cam.label?.toLowerCase().includes("front")
                      ? "Front Camera"
                      : `Camera ${index + 1}`}
                </option>
              ))}
            </select>
          )}

          {/* ✅ IMPORTANT: Scanner container */}
          <div id="qr-scanner" className="w-full max-w-xs"></div>

          {/* Loading */}
          {loading && (
            <div className="mt-4 flex items-center gap-2 text-blue-600">
              <Loader2 className="animate-spin" />
              <span>Processing...</span>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 text-red-600 text-sm">{error}</div>
        )}

        {/* Footer */}
        <div className="p-4 bg-gray-50 text-center text-xs text-gray-500">
          Allow camera access and scan QR code
        </div>
      </div>
    </div>
  );
};

export default QRScannerModal;
