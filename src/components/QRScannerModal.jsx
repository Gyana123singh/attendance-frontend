import { useState, useRef, useEffect } from 'react';
import { X, Loader2, Camera, AlertCircle } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { qrLogin } from '../services/api';
import { useNavigate } from 'react-router-dom';

const QRScannerModal = ({ isOpen, onClose }) => {
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const scannerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && !scanning) {
      startScanner();
    }
    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const startScanner = async () => {
    try {
      setScanning(true);
      setError('');
      const scanners = new Html5QrcodeScanner(
        'qr-scanner',
        { 
          fps: 10, 
          qrbox: { width: 300, height: 300 },
          formatsToSupport: ['QR_CODE']
        },
        false
      );
      
      scanners.render(
        onScanSuccess,
        onScanFailure,
        onScanError
      );
      scannerRef.current = scanners;
    } catch (err) {
      setError('Failed to start camera');
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      await scannerRef.current.clear();
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const onScanSuccess = async (decodedText) => {
    try {
      stopScanner();
      setLoading(true);
      setError('');

      // Parse QR data
      let qrCodeId;
      try {
        const data = JSON.parse(decodedText);
        qrCodeId = data.qrCodeId;
      } catch {
        throw new Error('Invalid QR code format');
      }

      // Get location
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      // Call API
      const { token, user } = await qrLogin(qrCodeId, location);
      
      // Store token
      localStorage.setItem('token', token);
      
      // Success - redirect
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Scan failed');
      setLoading(false);
    }
  };

  const onScanFailure = () => {
    // Silent fail - continue scanning
  };

  const onScanError = (err) => {
    // Silent error - continue scanning
  };

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Camera className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Scan QR Code</h2>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanner/Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          {scanning ? (
            <>
              <div id="qr-scanner" className="w-full max-w-xs"></div>
              {loading && (
                <div className="mt-4 flex items-center gap-2 text-blue-600">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing login...</span>
                </div>
              )}
            </>
          ) : (
            <div className="text-center">
              <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-2">Starting camera...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {error && (
          <div className="p-4 border-t border-red-100 bg-red-50">
            <div className="flex items-start gap-2 text-red-800 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}
        
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            Allow camera access and point at QR code
          </p>
        </div>
      </div>
    </div>
  );
};

export default QRScannerModal;

