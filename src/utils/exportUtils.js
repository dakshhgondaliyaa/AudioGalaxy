import QRCode from 'qrcode';

// Generate QR Code
export const generateQRCode = async (sessionId) => {
    try {
        // Encode a structured object so the scanner knows it's our code
        const dataPayload = JSON.stringify({
            type: 'AUDIO_GALAXY',
            id: sessionId
        });
        return await QRCode.toDataURL(dataPayload);
    } catch (err) {
        console.error("QR Gen Error", err);
        return null;
    }
};

export const downloadJSON = (data, filename) => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const createMockOscFile = (data, filename) => {
    // Mock binary format
    const blob = new Blob([JSON.stringify(data)], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.replace('.json', '.osc');
    document.body.appendChild(link);
    link.click();
};
