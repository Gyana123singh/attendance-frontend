import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/api";
import QRLoginButton from "../components/QRLoginButton";
import QRScannerModal from "../components/QRScannerModal";

export default function Login({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(email, password);

      console.log("LOGIN SUCCESS:", data);

      // ✅ store token + user
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // ✅ SAFE CALL (no crash)
      if (onSuccess) {
        onSuccess(data.user);
      } else {
        // fallback redirect using react-router
        navigate("/dashboard");
      }
    } catch (err) {
      console.log("LOGIN ERROR:", err);

      // ✅ correct error handling
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const [scannerOpen, setScannerOpen] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded-xl shadow w-80"
      >
        <h2 className="mb-4 font-semibold text-lg text-center">Login</h2>

        <input
          placeholder="Email"
          className="border p-2 w-full mb-3 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full mb-3 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p className="text-red-500 text-sm mb-2 text-center">{error}</p>
        )}

        <button
          disabled={loading}
          className={`w-full py-2 rounded text-white ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <div className="mt-4">
          <QRLoginButton onOpenScanner={() => setScannerOpen(true)} />
        </div>
      </form>

      <QRScannerModal isOpen={scannerOpen} onClose={() => setScannerOpen(false)} />
    </div>
  );
}
