import { useState } from 'react';
import QRLoginButton from '../components/QRLoginButton';
import QRScannerModal from '../components/QRScannerModal';
import { Info } from 'lucide-react';

const Login = () => {
  // Simple token check - redirect if logged in
  const token = localStorage.getItem('token');
  if (token) {
    window.location.href = '/dashboard';
    return null;
  }

  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleOpenScanner = () => {
    setIsScannerOpen(true);
  };

  const handleCloseScanner = () => {
    setIsScannerOpen(false);
  };

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

        {/* Traditional login form (placeholder) */}
        <div className="space-y-4 mb-8">
          <button className="w-full py-3 px-6 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl">
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

        {/* QR Login Button */}
        <QRLoginButton onOpenScanner={handleOpenScanner} />

        {/* SSO Info Box */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700 leading-relaxed">
              SSO integration available — contact your admin to enable Google or Microsoft sign-in.
            </p>
          </div>
        </div>

        <QRScannerModal isOpen={isScannerOpen} onClose={handleCloseScanner} />
      </div>
    </div>
  );
};

export default Login;

