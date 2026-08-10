'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { AlertCircle } from 'lucide-react'

interface QrScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (errorMessage: string) => void;
  onPermissionError?: () => void;
}

export function QrScanner({ onScanSuccess, onScanFailure, onPermissionError }: QrScannerProps) {
  const [permissionDenied, setPermissionDenied] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isStartedRef = useRef(false);

  useEffect(() => {
    // Prevent double initialization in strict mode
    if (scannerRef.current) return;
    
    // We wrap it in a small timeout to ensure the DOM element "#qr-reader" is mounted
    const timeout = setTimeout(() => {
      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      // Start camera with preferred rear-facing camera directly
      html5QrCode.start(
        { facingMode: "environment" }, 
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          if (scannerRef.current) {
            scannerRef.current.pause();
          }
          onScanSuccess(decodedText);
        },
        (errorMessage) => {
          if (onScanFailure) onScanFailure(errorMessage);
        }
      ).then(() => {
        isStartedRef.current = true;
      }).catch((err) => {
        console.error("Camera start error:", err);
        setPermissionDenied(true);
        if (onPermissionError) onPermissionError();
      });
    }, 100);

    return () => {
      clearTimeout(timeout);
      if (scannerRef.current && isStartedRef.current) {
        scannerRef.current.stop().catch(console.error);
        scannerRef.current = null;
        isStartedRef.current = false;
      }
    };
  }, [onScanSuccess, onScanFailure, onPermissionError]);

  if (permissionDenied) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center space-y-3">
        <div className="flex justify-center text-red-400 mb-2">
          <AlertCircle size={32} />
        </div>
        <h3 className="font-semibold text-red-400">Camera Access Blocked</h3>
        <p className="text-sm text-zinc-400">
          Your browser has blocked camera access for this site. 
          Please enable it in your browser settings, or simply use your phone's native camera app to scan the QR code!
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl bg-black border border-white/10">
      <div id="qr-reader" className="w-full"></div>
    </div>
  );
}
