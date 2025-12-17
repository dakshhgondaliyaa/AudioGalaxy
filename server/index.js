import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

// ESM fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Debug Logging
app.use((req, res, next) => {
    console.log(`[DEBUG] Request: ${req.method} ${req.url}`);
    next();
});

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/audiogalaxy';
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected to Galaxy Database'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Models (Defined inline or imported - needing ESM conversion for imported models too, 
// but since I can't easily see/convert all models in one shot efficiently without reading them,
// I will rewrite the require logic to dynamic import OR just assume I should convert them. 
// Wait, for simplicity in this "Standard Project", I should convert them.
// HOWEVER, to avoid breaking too many things blindly, I will use `await import()` or just keep them as CommonJS files?
// Node.js allows importing CJS from ESM. So `import Session from './models/Session.js'` works even if Session.js is CJS? 
// No, standard `import` expects ESM or named exports. 
// Safest bet: I rewrite the top-level server file to ESM, but if models are CJS `module.exports`, 
// I should use `import Session from './models/Session.js'` (default import). 
// Node Handles: `module.exports = ...` -> `import x from ...`. Yes usually works for default export.
// Let's TRY importing. If it fails, I'll fix models. 

// Actually, I'll just change the import style below.
import Session from './models/Session.js';
import ScanLog from './models/ScanLog.js';

// Storage Engine
const storage = multer.diskStorage({
    destination: './server/uploads/', // Changed path to be explicit inside valid server dir? Or root uploads?
    // User structure: /server/uploads created in plan.
    // Let's use root `uploads` folder for simplicity? No, implementation plan said `server/uploads`. 
    // I need to ensure that dir exists.
    filename: function (req, file, cb) {
        cb(null, 'AUDIO-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Ensure uploads dir exists (Relative to Project Root now, or inside server?)
// Let's put it in `server/uploads`.
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Routes

// Serve Static Uploads
app.use('/uploads', express.static(uploadDir));

// Upload Audio Session
app.post('/api/upload', upload.single('audioFile'), async (req, res) => {
    try {
        const { duration, metadata } = req.body;
        const newSession = new Session({
            sessionId: req.file.filename,
            duration: duration || 0,
            status: 'completed',
            metadata: metadata ? JSON.parse(metadata) : {}
        });
        await newSession.save();

        // Return full public URL
        const protocol = req.protocol;
        const host = req.get('host');
        const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

        res.json({
            success: true,
            session: newSession,
            url: fileUrl
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get All Sessions
app.get('/api/sessions', async (req, res) => {
    try {
        const sessions = await Session.find().sort({ timestamp: -1 });
        res.json({ success: true, sessions });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Single Session by ID
app.get('/api/sessions/:id', async (req, res) => {
    try {
        const session = await Session.findOne({ sessionId: req.params.id });
        if (!session) {
            return res.status(404).json({ success: false, message: 'Signal not found in galaxy database' });
        }
        res.json({ success: true, session });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Log Scan Result
app.post('/api/scan', async (req, res) => {
    try {
        const { targetSector, signalStrength } = req.body;
        const newScan = new ScanLog({
            scanId: 'SC-' + Date.now(),
            targetSector,
            signalStrength,
            frequencySignature: Array.from({ length: 10 }, () => Math.random() * 100),
            status: 'detected'
        });
        await newScan.save();
        res.json({ success: true, scan: newScan });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Serve Static Assets in Production
// Now dist is in root: ../dist
app.use(express.static(path.join(__dirname, '../dist')));

// Catch-all to serve React App
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
