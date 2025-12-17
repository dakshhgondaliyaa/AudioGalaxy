import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema({
    sessionId: { type: String, required: true, unique: true },
    timestamp: { type: Date, default: Date.now },
    duration: { type: Number }, // in seconds
    format: { type: String, default: 'webm' },
    status: { type: String, enum: ['active', 'completed', 'archived'], default: 'completed' },
    metadata: {
        device: String,
        sampleRate: Number
    }
});

export default mongoose.model('Session', SessionSchema);
