import { useState, useEffect } from "react";
import QRLoginButton from "../components/QRLoginButton";
import QRScannerModal from "../components/QRScannerModal";
import { Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const navigate = useNavigate();

  // ✅ FIX: proper redirect
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">Sign in to your attendance account</p>
        </div>

        {/* Email login (placeholder) */}
        <div className="space-y-4 mb-8">
          <button className="w-full py-3 px-6 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium">
            Email & Password
          </button>
        </div>

        {/* Divider */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="px-4 bg-white text-gray-500 font-medium">
              Or sign in with
            </span>
          </div>
        </div>

        {/* QR Button */}
        <QRLoginButton onOpenScanner={() => setIsScannerOpen(true)} />

        {/* ⚠️ IMPORTANT USER MESSAGE */}
        <div className="mt-6 text-xs text-center text-red-500">
          Open this page in Chrome browser and allow camera access
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 mt-0.5" />
            <p className="text-sm text-gray-700">
              SSO integration available — contact your admin.
            </p>
          </div>
        </div>

        <QRScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
        />
      </div>
    </div>
  );
};

export default Login;
