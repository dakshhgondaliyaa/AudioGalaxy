import React, { useEffect, useState } from 'react';
import { Play, Link as LinkIcon, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { generateQRCode } from '../utils/exportUtils';

const RecordingList = ({ refreshTrigger }) => {
    const [sessions, setSessions] = useState([]);
    const [activeQr, setActiveQr] = useState(null);

    useEffect(() => {
        fetchSessions();
    }, [refreshTrigger]);

    const fetchSessions = async () => {
        try {
            const res = await fetch('/api/sessions');
            const data = await res.json();
            if (data.success) {
                setSessions(data.sessions);
            }
        } catch (err) {
            console.error("Failed to fetch sessions", err);
        }
    };

    const handleShowQR = async (url) => {
        if (activeQr === url) {
            setActiveQr(null);
            return;
        }
        const qr = await generateQRCode(url);
        setActiveQr(url);
    };

    return (
        <div className="absolute top-24 right-8 w-80 glass-panel p-4 overflow-y-auto max-h-[80vh] z-10 transition-all">
            <h2 className="text-neon-cyan font-orbitron mb-4 text-lg border-b border-white/10 pb-2">Session History</h2>

            {sessions.length === 0 ? (
                <div className="text-white/40 text-sm text-center py-4">No audio logs found.</div>
            ) : (
                <div className="space-y-3">
                    {sessions.map((session) => (
                        <motion.div
                            key={session._id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white/5 border border-white/10 p-3 rounded-md hover:border-neon-cyan/50 transition-colors"
                        >
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-neon-pink font-mono">{new Date(session.timestamp).toLocaleTimeString()}</span>
                                <span className="text-[10px] text-white/50">{session.sessionId.substring(0, 12)}...</span>
                            </div>

                            <div className="flex gap-2">
                                <audio controls src={`/uploads/${session.sessionId}`} className="w-full h-8 opacity-80" />
                            </div>

                            <div className="flex gap-2 mt-2 justify-end">
                                <button
                                    onClick={() => handleShowQR(`${window.location.origin}/uploads/${session.sessionId}`)}
                                    className="p-1 hover:text-neon-cyan transition-colors"
                                    title="Show QR Code"
                                >
                                    <LinkIcon size={14} />
                                </button>
                                <a
                                    href={`/uploads/${session.sessionId}`}
                                    download
                                    className="p-1 hover:text-neon-cyan transition-colors"
                                    title="Download"
                                >
                                    <Download size={14} />
                                </a>
                            </div>

                            {activeQr && activeQr.includes(session.sessionId) && (
                                <div className="mt-2 flex justify-center bg-white p-2 rounded">
                                    <img src={activeQr} alt="QR Code" className="w-24 h-24" />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RecordingList;
