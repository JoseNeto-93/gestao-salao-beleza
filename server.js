
/**
 * SERVIDOR BACKEND BELLAFLOW (NODE.JS)
 * Instruções:
 * 1. Instale o Node.js em sua máquina.
 * 2. Execute: npm install express whatsapp-web.js qrcode cors
 * 3. Execute: node server.js
 */

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

let lastQr = "";
let status = "DISCONNECTED"; // DISCONNECTED, CONNECTING, CONNECTED
let clientReady = false;

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        handleSIGINT: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }
});

client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    lastQr = qr;
    status = "WAITING_FOR_SCAN";
});

client.on('ready', () => {
    console.log('CLIENT IS READY');
    status = "CONNECTED";
    clientReady = true;
    lastQr = "";
});

client.on('authenticated', () => {
    console.log('AUTHENTICATED');
    status = "AUTHENTICATING";
});

client.on('auth_failure', msg => {
    console.error('AUTHENTICATION FAILURE', msg);
    status = "DISCONNECTED";
});

client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
    status = "DISCONNECTED";
    clientReady = false;
    client.initialize();
});

// Inicializa o cliente
client.initialize();

// Endpoints da API
app.get('/status', (req, res) => {
    res.json({ status, ready: clientReady });
});

app.get('/qr', async (req, res) => {
    if (lastQr) {
        try {
            const qrImage = await qrcode.toDataURL(lastQr);
            res.json({ qr: qrImage });
        } catch (err) {
            res.status(500).json({ error: "Failed to generate QR image" });
        }
    } else {
        res.json({ qr: null, message: status === "CONNECTED" ? "Already connected" : "QR not ready" });
    }
});

app.post('/logout', async (req, res) => {
    try {
        await client.logout();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Logout failed" });
    }
});

app.listen(port, () => {
    console.log(`Backend BellaFlow rodando em http://localhost:${port}`);
});
