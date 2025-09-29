import { useState, useEffect } from 'react';
import { generateStyledQRCode, downloadQRCode } from '../utils/qrGenerator';

interface QRCodeDisplayProps {
  url: string;
  title?: string;
  size?: number;
  showDownload?: boolean;
  className?: string;
}

export function QRCodeDisplay({ 
  url, 
  title, 
  size = 256, 
  showDownload = true,
  className = ""
}: QRCodeDisplayProps) {
  const [qrImageDataUrl, setQrImageDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (url) {
      generateQRCode();
    }
  }, [url]);

  const generateQRCode = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const dataUrl = await generateStyledQRCode(url, true);
      setQrImageDataUrl(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (qrImageDataUrl) {
      const filename = title 
        ? `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-qr.png`
        : 'qrcode.png';
      downloadQRCode(qrImageDataUrl, filename);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
        <p className="text-red-400 text-sm mb-2">{error}</p>
        <button
          onClick={generateQRCode}
          className="text-pink-400 hover:text-pink-300 text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!qrImageDataUrl) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <button
          onClick={generateQRCode}
          className="text-gray-400 hover:text-pink-400 text-sm"
        >
          Generate QR Code
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center space-y-2 ${className}`}>
      <img
        src={qrImageDataUrl}
        alt={`QR Code${title ? ` for ${title}` : ''}`}
        className="rounded-lg border border-gray-600"
        style={{ width: size, height: size }}
      />
      {showDownload && (
        <button
          onClick={handleDownload}
          className="text-pink-400 hover:text-pink-300 text-sm"
        >
          Download
        </button>
      )}
    </div>
  );
}
