import mongoose from 'mongoose';

const ScanLogSchema = new mongoose.Schema({
    scanId: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    targetSector: { type: String },
    frequencySignature: { type: [Number] }, // Array of frequencies detected
    signalStrength: { type: Number },
    status: { type: String, enum: ['detected', 'clear', 'error'], default: 'clear' }
});

export default mongoose.model('ScanLog', ScanLogSchema);
