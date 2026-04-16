import { QrCode } from "lucide-react";

const QRLoginButton = ({ onOpenScanner }) => {
  return (
    <button
      onClick={onOpenScanner}
      className="flex items-center justify-center gap-3 w-full px-6 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all text-gray-800 font-medium text-lg"
    >
      <QrCode className="w-6 h-6" />
      <span>Scan QR Code</span>
    </button>
  );
};

export default QRLoginButton;