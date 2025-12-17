import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QRScanner = ({ onScanSuccess, onScanFailure, onClose }) => {
    const scannerRef = useRef(null);
    const [scanError, setScanError] = useState(null);

    useEffect(() => {
        // Initialize Scanner
        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
        );

        scanner.render(
            (decodedText) => {
                // Success Callback
                onScanSuccess(decodedText);
                scanner.clear();
            },
            (error) => {
                // Failure Callback (called frequently while scanning)
                // console.warn(error);
                if (onScanFailure) onScanFailure(error);
            }
        );

        scannerRef.current = scanner;

        // Cleanup
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => {
                    console.error("Failed to clear html5-qrcode scanner. ", error);
                });
            }
        };
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="glass-panel w-full max-w-md p-6 rounded-xl border border-[var(--neon-green)] flex flex-col items-center gap-4 relative">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/50 hover:text-white"
                >
                    ✕
                </button>

                <h2 className="font-hud text-xl text-[var(--neon-green)] tracking-widest animate-pulse">
                    SCANNING FREQUENCY
                </h2>

                <div id="reader" className="w-full h-64 overflow-hidden rounded-lg border-2 border-dashed border-[var(--neon-green)]/30"></div>

                <p className="text-xs font-mono text-green-400 text-center mt-2">
                    ALIGN QR CODE WITHIN TARGET RETICLE
                </p>

                {scanError && (
                    <p className="text-xs text-red-500 font-mono">{scanError}</p>
                )}
            </div>
        </div>
    );
};

export default QRScanner;
