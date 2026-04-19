'use strict';

/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║   GhostG-X — SESSION SERVER v1.0                        ║
 * ║   Génère les pairing codes et exporte les Session IDs   ║
 * ╚══════════════════════════════════════════════════════════╝
 */

require('dotenv').config();

const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const fs       = require('fs');
const os       = require('os');
const pino     = require('pino');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  Browsers,
  fetchLatestBaileysVersion,
} = require('@whiskeysockets/baileys');

const PORT         = process.env.PORT || 3000;
const SESSION_DIR  = path.join(process.cwd(), 'sessions');
const ALLOWED_ORIGIN = process.env.FRONTEND_URL || '*';

const RATE_WINDOW  = 60_000;
const RATE_MAX     = 3;
const _rateLimits  = new Map();

if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR, { recursive: true });

const logger = pino({ level: 'silent' });
const app    = express();

app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const activeSessions = new Map();

setInterval(() => {
  const cutoff = Date.now() - 10 * 60_000;
  for (const [phone, s] of activeSessions.entries()) {
    if (s.createdAt < cutoff && s.status !== 'connected') {
      try { s.sock?.end?.(); } catch (_) {}
      activeSessions.delete(phone);
    }
  }
}, 60_000);

function rateLimit(req, res, next) {
  const ip  = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'unknown';
  const now = Date.now();
  let record = _rateLimits.get(ip) || { times: [], blocked: 0 };
  record.times = record.times.filter(t => now - t < RATE_WINDOW);
  if (record.blocked > now) {
    return res.status(429).json({ error: 'Trop de requêtes. Réessaie dans 60 secondes.' });
  }
  if (record.times.length >= RATE_MAX) {
    record.blocked = now + RATE_WINDOW;
    _rateLimits.set(ip, record);
    return res.status(429).json({ error: 'Limite atteinte. Patiente 60 secondes.' });
  }
  record.times.push(now);
  _rateLimits.set(ip, record);
  next();
}

function cleanPhone(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15) return null;
  return digits;
}

async function generateSessionId(phone) {
  const sessionFolder = path.join(SESSION_DIR, `session_${phone}`);
  const files = {};
  if (fs.existsSync(sessionFolder)) {
    for (const f of fs.readdirSync(sessionFolder)) {
      const fpath = path.join(sessionFolder, f);
      try { files[f] = fs.readFileSync(fpath, 'utf-8'); } catch (_) {}
    }
  }
  if (Object.keys(files).length === 0) return null;
  const payload = JSON.stringify(files);
  const b64     = Buffer.from(payload).toString('base64');
  return `GX:${b64}`;
}

async function createPairingSession(phone) {
  if (activeSessions.has(phone)) {
    const existing = activeSessions.get(phone);
    if (existing.status === 'connected') return null;
    try { existing.sock?.end?.(); } catch (_) {}
    activeSessions.delete(phone);
  }

  const sessionFolder = path.join(SESSION_DIR, `session_${phone}`);
  if (!fs.existsSync(sessionFolder)) fs.mkdirSync(sessionFolder, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);

  let version;
  try {
    const r = await Promise.race([
      fetchLatestBaileysVersion(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 8_000)),
    ]);
    version = r.version;
  } catch (_) {
    version = [2, 3000, 1015901307];
  }

  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal : false,
    browser           : Browsers.ubuntu('Chrome'),
    auth              : state,
    syncFullHistory   : false,
    downloadHistory   : false,
    markOnlineOnConnect: false,
  });

  const entry = { sock, status: 'pending', sessionId: null, createdAt: Date.now(), code: null };
  activeSessions.set(phone, entry);

  let codeResolve, codeReject;
  const codePromise = new Promise((res, rej) => { codeResolve = res; codeReject = rej; });
  const codeTimeout = setTimeout(() => codeReject(new Error('Timeout pairing code')), 15_000);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'open') {
      clearTimeout(codeTimeout);
      entry.status = 'connected';
      await saveCreds();
      const sid = await generateSessionId(phone);
      if (sid) {
        entry.sessionId = sid;
        try { fs.rmSync(sessionFolder, { recursive: true, force: true }); } catch (_) {}
      }
    }
  });

  sock.ev.on('creds.update', saveCreds);

  setTimeout(async () => {
    try {
      const code = await sock.requestPairingCode(phone);
      const formatted = code?.match(/.{1,4}/g)?.join('-') || code;
      entry.code = formatted;
      codeResolve(formatted);
    } catch (err) {
      codeReject(err);
    }
  }, 3000);

  return codePromise;
}

app.post('/api/pairing', rateLimit, async (req, res) => {
  try {
    const phone = cleanPhone(req.body?.phone);
    if (!phone) return res.status(400).json({ error: 'Numéro invalide.' });
    const code = await createPairingSession(phone);
    if (!code) {
      const s = activeSessions.get(phone);
      if (s?.status === 'connected') return res.json({ code: 'DÉJÀ CONNECTÉ', alreadyConnected: true });
      return res.status(500).json({ error: 'Impossible de générer le code. Réessaie.' });
    }
    res.json({ code });
  } catch (err) {
    console.error('[pairing]', err.message);
    res.status(500).json({ error: 'Erreur serveur. Réessaie dans quelques instants.' });
  }
});

app.get('/api/status', async (req, res) => {
  const phone = cleanPhone(req.query?.phone);
  if (!phone) return res.status(400).json({ error: 'Numéro manquant.' });
  const s = activeSessions.get(phone);
  if (!s) return res.json({ status: 'not_found' });
  res.json({ status: s.status, sessionId: s.status === 'connected' ? (s.sessionId || null) : null });
});

app.get('/health', (_, res) => res.json({ ok: true, uptime: process.uptime() }));

app.listen(PORT, () => {
  console.log(`\n╭── GhostG-X Session Server ──────────────╮`);
  console.log(`│  ✅ Serveur démarré sur le port ${PORT}      │`);
  console.log(`│  📡 POST /api/pairing                   │`);
  console.log(`│  📡 GET  /api/status                    │`);
  console.log(`╰─────────────────────────────────────────╯\n`);
});