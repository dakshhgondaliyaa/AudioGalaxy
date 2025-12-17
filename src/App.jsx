import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import GalaxyBackground from './components/GalaxyBackground';
import ControlPanel from './components/ControlPanel';
import AudioVisualizer from './components/AudioVisualizer';
import QRScanner from './components/QRScanner';
import RecordingList from './components/RecordingList';
import { AudioProvider, useAudio } from './context/AudioContext';

/* Wrapper component to access AudioContext inside App logic if needed,
   but for now App just passes state. Actually, we need to Trigger Init from Control Panel */

const InnerApp = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [recorder, setRecorder] = useState(null);
  const [reviewBlob, setReviewBlob] = useState(null);
  const [scannedAudio, setScannedAudio] = useState(null);
  const [refreshList, setRefreshList] = useState(0);
  const { initAudio, stopAudio, startRecording } = useAudio();

  const handleStart = async () => {
    await initAudio();
    const mediaRecorder = startRecording();
    setRecorder(mediaRecorder);
    setIsRecording(true);
    setQrCode(null);
    setReviewBlob(null);
  };

  const handleStop = () => {
    if (recorder) {
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setReviewBlob(e.data); // Store for review
        }
      };
      recorder.stop();
      setRecorder(null);
    }
    stopAudio();
    setIsRecording(false);
  };

  const handleSaveRecording = async () => {
    if (!reviewBlob) return;

    const formData = new FormData();
    formData.append('audioFile', reviewBlob, `recording-${Date.now()}.webm`);
    formData.append('duration', '10');

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();

      if (data.success) {
        // Use the simplified ID generation which now creates a proper JSON QR payload
        const url = await import('./utils/exportUtils').then(m => m.generateQRCode(data.session.sessionId));
        setQrCode(url);
        setRefreshList(prev => prev + 1);
        setReviewBlob(null);
      }
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  const handleDiscardRecording = () => {
    setReviewBlob(null);
  };

  const handleScan = () => {
    setIsScanning(true);
    setScannedAudio(null);
  };

  const handleScanSuccess = async (decodedText) => {
    try {
      console.log("Raw Scan:", decodedText);
      const data = JSON.parse(decodedText);

      // Validate Format
      if (data.type === 'AUDIO_GALAXY' && data.id) {
        setIsScanning(false);

        // Fetch audio details
        const res = await fetch(`/api/sessions/${data.id}`);
        const result = await res.json();

        if (result.success) {
          // Found audio!
          // Construct full URL (assuming /uploads/filename approach from backend)
          // Note: server returns 'session' object. status need to be checked? 
          // The file url is not strictly in the DB model shown, but the filename is 'sessionId' if we look at the upload logic?
          // Wait, look at upload logic: sessionId: req.file.filename. 
          // So URL is /uploads/{session.sessionId}

          const audioUrl = `/uploads/${result.session.sessionId}`;
          setScannedAudio({ ...result.session, url: audioUrl });
        } else {
          alert("Signal lost: " + result.message);
        }
      } else {
        console.warn("Invalid Galaxy QR Signature");
      }
    } catch (e) {
      console.error("Scan Parse Error", e);
    }
  };

  const handleScanFailure = (err) => {
    // console.warn(err);
  };

  return (
    <div className="relative w-full h-screen bg-black text-white overflow-hidden">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
          <GalaxyBackground />
        </Canvas>
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50">
        <div className="glass-panel px-6 py-2 rounded-full border border-[var(--neon-cyan)]/30 flex items-center gap-4">
          <span className="font-hud text-xl text-neon tracking-widest">AUDIO GALAXY</span>
          <div className="h-4 w-px bg-white/20"></div>
          <span className="font-body text-sm text-blue-300 tracking-wider">MULTIVERSE SYSTEM v5.0</span>
        </div>
        <div className="glass-panel px-4 py-1 rounded-full border border-[var(--plasma-pink)]/30">
          <span className="text-xs font-mono text-pink-400 animate-pulse">
            STATUS: {isRecording ? 'RECORDING ACTIVE' : isScanning ? 'SCANNING SECTOR...' : 'SYSTEM READY'}
          </span>
        </div>
      </header>

      {/* History List */}
      <RecordingList refreshTrigger={refreshList} />

      {/* UI Layer */}
      <main className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8 gap-12">

        {/* Central visualizer area */}
        <div className="relative w-full max-w-4xl h-64 border border-white/10 rounded-lg flex items-center justify-center bg-black/20 backdrop-blur-sm overflow-hidden">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-[var(--deep-navy)]/20 blur-md"></div>

          {/* Visualizer Canvas */}
          <div className="absolute inset-0 z-10">
            <AudioVisualizer isActive={isRecording} />
          </div>

          {!isRecording && !isScanning && (
            <p className="z-20 font-hud text-2xl text-white/30 animate-pulse tracking-widest pointer-events-none">
              INITIATE AUDIO SCAN SEQUENCE
            </p>
          )}
        </div>

        <ControlPanel
          onStart={handleStart}
          onStop={handleStop}
          onScan={handleScan}
          isRecording={isRecording}
          isScanning={isScanning}
        />

      </main>

      {/* Review Modal */}
      {reviewBlob && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="glass-panel p-8 rounded-xl border border-[var(--neon-green)] flex flex-col items-center gap-6 max-w-sm w-full">
            <h2 className="font-hud text-xl text-neon tracking-widest text-center">TRANSMISSION CAPTURED</h2>
            <p className="text-white/60 text-sm text-center">Do you wish to archive this signal to the galaxy database?</p>

            <div className="flex gap-4 w-full">
              <button
                onClick={handleDiscardRecording}
                className="flex-1 py-2 border border-red-500/50 text-red-400 hover:bg-red-500/10 font-hud text-xs tracking-wider"
              >
                DISCARD
              </button>
              <button
                onClick={handleSaveRecording}
                className="flex-1 py-2 bg-[var(--neon-cyan)]/10 border border-[var(--neon-cyan)] text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)] hover:text-black font-hud text-xs tracking-wider transition-all"
              >
                SAVE TO DB
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {qrCode && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="glass-panel p-8 rounded-xl border border-[var(--neon-cyan)] flex flex-col items-center gap-6 max-w-md w-full relative">
            <button
              onClick={() => setQrCode(null)}
              className="absolute top-4 right-4 text-white/50 hover:text-white"
            >
              ✕
            </button>

            <h2 className="font-hud text-2xl text-neon tracking-widest text-center">SCAN COMPLETE</h2>

            <div className="p-4 bg-white rounded-lg">
              <img src={qrCode} alt="Scan QR" className="w-48 h-48" />
            </div>

            <div className="text-center space-y-2">
              <p className="font-mono text-xs text-blue-300">DATA_HASH: {Date.now().toString(16).toUpperCase()}</p>
              <p className="font-mono text-xs text-green-400">STATUS: EXPORTED TO DISK</p>
            </div>

            <button
              onClick={() => setQrCode(null)}
              className="w-full py-2 bg-[var(--deep-navy)] border border-[var(--neon-cyan)] text-[var(--neon-cyan)] font-hud tracking-wider hover:bg-[var(--neon-cyan)] hover:text-black transition-colors"
            >
              ACKNOWLEDGE
            </button>
          </div>
        </div>
      )}

      {/* Scanned Audio Player Modal */}
      {scannedAudio && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="glass-panel p-8 rounded-xl border border-[var(--plasma-pink)] flex flex-col items-center gap-6 max-w-md w-full relative">
            <button
              onClick={() => setScannedAudio(null)}
              className="absolute top-4 right-4 text-white/50 hover:text-white"
            >
              ✕
            </button>

            <h2 className="font-hud text-xl text-[var(--plasma-pink)] tracking-widest text-center animate-pulse">
              INCOMING TRANSMISSION
            </h2>

            <div className="w-full bg-black/40 p-4 rounded-lg text-center border border-white/10">
              <p className="text-xs font-mono text-pink-300 mb-4">
                ID: {scannedAudio.sessionId.substring(0, 12)}...
              </p>

              <audio controls autoPlay src={scannedAudio.url} className="w-full" />
            </div>

            <div className="text-center">
              <p className="text-xs text-white/40">signal_strength: 100% // sector: local</p>
            </div>
          </div>
        </div>
      )}

      {/* QR Scanner Overlay */}
      {isScanning && (
        <QRScanner
          onScanSuccess={handleScanSuccess}
          onScanFailure={handleScanFailure}
          onClose={() => setIsScanning(false)}
        />
      )}
    </div>
  );
};

function App() {
  return (
    <AudioProvider>
      <InnerApp />
    </AudioProvider>
  );
}

export default App;
