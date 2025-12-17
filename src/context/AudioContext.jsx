import React, { createContext, useContext, useRef, useState, useEffect } from 'react';

const AudioContextState = createContext();

export const useAudio = () => useContext(AudioContextState);

export const AudioProvider = ({ children }) => {
    const [isReady, setIsReady] = useState(false);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const sourceRef = useRef(null);
    const streamRef = useRef(null);

    // Frequency data buffer
    const dataArrayRef = useRef(null);

    const initAudio = async () => {
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const analyser = audioContextRef.current.createAnalyser();
            analyser.fftSize = 2048; // High resolution for smooth waves
            analyser.smoothingTimeConstant = 0.8;
            analyserRef.current = analyser;

            const source = audioContextRef.current.createMediaStreamSource(stream);
            source.connect(analyser);
            sourceRef.current = source;

            // Initialize data array
            const bufferLength = analyser.frequencyBinCount;
            dataArrayRef.current = new Uint8Array(bufferLength);

            setIsReady(true);

            // Resume context if suspended
            if (audioContextRef.current.state === 'suspended') {
                await audioContextRef.current.resume();
            }

        } catch (err) {
            console.error("Audio Engine Initialization Failed:", err);
            // Handle permission denied or other errors
        }
    };

    const startRecording = () => {
        if (!streamRef.current) return;
        const mediaRecorder = new MediaRecorder(streamRef.current);
        const chunks = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
        };

        mediaRecorder.start();
        return mediaRecorder;
    };

    const stopAudio = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close().then(() => {
                audioContextRef.current = null;
                setIsReady(false);
            });
        }
    };

    const getAudioData = () => {
        if (analyserRef.current && dataArrayRef.current) {
            analyserRef.current.getByteTimeDomainData(dataArrayRef.current);
            // For spectrum: analyserRef.current.getByteFrequencyData(dataArrayRef.current);
            return dataArrayRef.current;
        }
        return null;
    };

    const getFrequencyData = () => {
        if (analyserRef.current && dataArrayRef.current) {
            analyserRef.current.getByteFrequencyData(dataArrayRef.current);
            return dataArrayRef.current;
        }
        return null;
    }

    // Auto clean up
    useEffect(() => {
        return () => stopAudio();
    }, []);

    return (
        <AudioContextState.Provider value={{
            initAudio,
            stopAudio,
            startRecording,
            isReady,
            getAudioData,
            getFrequencyData,
            analyser: analyserRef.current
        }}>
            {children}
        </AudioContextState.Provider>
    );
};
