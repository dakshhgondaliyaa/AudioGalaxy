import React, { useRef, useEffect } from 'react';
import { useAudio } from '../context/AudioContext';

const AudioVisualizer = ({ isActive }) => {
    const canvasRef = useRef(null);
    const { isReady, getAudioData, getFrequencyData } = useAudio();
    const animationRef = useRef();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Set explicit size for retina screens
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);

        const render = () => {
            if (!isActive || !isReady) {
                ctx.clearRect(0, 0, rect.width, rect.height);
                // Draw idle line
                ctx.beginPath();
                ctx.moveTo(0, rect.height / 2);
                ctx.lineTo(rect.width, rect.height / 2);
                ctx.strokeStyle = 'rgba(0, 243, 255, 0.2)';
                ctx.lineWidth = 1;
                ctx.stroke();
                animationRef.current = requestAnimationFrame(render);
                return;
            }

            const waveData = getAudioData(); // Time domain data (waveform)
            // const freqData = getFrequencyData(); // Frequency data (spectrum)

            if (!waveData) return;

            const width = rect.width;
            const height = rect.height;

            ctx.clearRect(0, 0, width, height);

            // --- Draw Glow Effect ---
            ctx.shadowBlur = 15;
            ctx.shadowColor = "#00f3ff";

            // --- Draw Waveform ---
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#00f3ff';
            ctx.beginPath();

            const sliceWidth = width * 1.0 / waveData.length;
            let x = 0;

            for (let i = 0; i < waveData.length; i++) {
                const v = waveData[i] / 128.0; // 128 is zero crossing
                const y = (v * height) / 2;

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }

                x += sliceWidth;
            }

            ctx.lineTo(width, height / 2);
            ctx.stroke();

            // Reset Shadow
            ctx.shadowBlur = 0;

            animationRef.current = requestAnimationFrame(render);
        };

        render();

        return () => cancelAnimationFrame(animationRef.current);
    }, [isActive, isReady, getAudioData]);

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-full rounded-lg"
            style={{ filter: 'drop-shadow(0 0 10px rgba(0,243,255,0.3))' }}
        />
    );
};

export default AudioVisualizer;
