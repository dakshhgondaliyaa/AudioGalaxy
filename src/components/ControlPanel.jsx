import React from 'react';
import { motion } from 'framer-motion';
import { Mic, StopCircle, Radio, Disc } from 'lucide-react';

const ControlButton = ({ onClick, label, icon: Icon, color = 'cyan', active = false, disabled = false }) => {
    const glowColor = color === 'cyan' ? 'var(--neon-cyan)' : color === 'pink' ? 'var(--plasma-pink)' : 'var(--nebula-purple)';

    return (
        <motion.button
            whileHover={{ scale: 1.05, boxShadow: `0 0 20px ${glowColor}` }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            disabled={disabled}
            className={`
        relative px-8 py-4 rounded-lg font-hud text-lg tracking-widest uppercase flex items-center gap-3 transition-colors
        ${active ? 'bg-opacity-20 bg-white border-white' : 'bg-black/40 border-white/20'}
        border backdrop-blur-md
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
            style={{
                color: active ? '#fff' : glowColor,
                borderColor: active ? '#fff' : glowColor,
                boxShadow: active ? `0 0 30px ${glowColor}` : 'none'
            }}
        >
            <Icon size={24} className={active ? 'animate-pulse' : ''} />
            {label}

            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2" style={{ borderColor: glowColor }} />
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2" style={{ borderColor: glowColor }} />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2" style={{ borderColor: glowColor }} />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2" style={{ borderColor: glowColor }} />
        </motion.button>
    );
};

const ControlPanel = ({ onStart, onStop, onScan, isRecording, isScanning }) => {
    return (
        <div className="flex flex-col items-center gap-8 w-full max-w-4xl z-50">

            {/* Main Controls */}
            <div className="flex flex-wrap justify-center gap-6">
                {!isRecording ? (
                    <ControlButton
                        onClick={onStart}
                        label="Initialize Link"
                        icon={Mic}
                        color="cyan"
                        disabled={isScanning}
                    />
                ) : (
                    <ControlButton
                        onClick={onStop}
                        label="Stop Recording"
                        icon={StopCircle}
                        color="pink"
                        active
                    />
                )}

                <ControlButton
                    onClick={onScan}
                    label={isScanning ? "Scanning..." : "Scan Nodes"}
                    icon={Radio}
                    color="purple"
                    active={isScanning}
                    disabled={isRecording}
                />
            </div>

            {/* Decorative Status Line */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent my-4" />

            {/* Secondary Actions Placeholder (Save/Export) */}
            <div className="flex gap-4 opacity-70">
                <div className="text-xs font-mono text-blue-300 flex items-center gap-2">
                    <Disc size={12} /> SYSTEM IDLE
                </div>
            </div>

        </div>
    );
};

export default ControlPanel;
