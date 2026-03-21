/**
 * GhostG-X Bot - Main Entry Point
 * Optimized for Pairing Code
 */
process.env.PUPPETEER_SKIP_DOWNLOAD = 'true';
process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true';
process.env.PUPPETEER_CACHE_DIR = process.env.PUPPETEER_CACHE_DIR || '/tmp/puppeteer_cache_disabled';

const { initializeTempSystem } = require('./utils/tempManager');
const { startCleanup } = require('./utils/cleanup');
initializeTempSystem();
startCleanup();

const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

const forbiddenPatternsConsole = [
  'closing session', 'closing open session', 'sessionentry', 'prekey bundle',
  'pendingprekey', '_chains', 'registrationid', 'currentratchet', 'chainkey',
  'ratchet', 'signal protocol', 'ephemeralkeypair', 'indexinfo', 'basekey'
];

const filterLogs = (args, originalFn) => {
  const message = args.map(a => typeof a === 'string' ? a : typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ').toLowerCase();
  if (!forbiddenPatternsConsole.some(pattern => message.includes(pattern))) {
    originalFn.apply(console, args);
  }
};

console.log = (...args) => filterLogs(args, originalConsoleLog);
console.error = (...args) => filterLogs(args, originalConsoleError);
console.warn = (...args) => filterLogs(args, originalConsoleWarn);

const pino = require('pino');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  Browsers,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const config = require('./config');
const handler = require('./handler');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const os = require('os');

function cleanupPuppeteerCache() {
  try {
    const home = os.homedir();
    const cacheDir = path.join(home, '.cache', 'puppeteer');
    if (fs.existsSync(cacheDir)) {
      fs.rmSync(cacheDir, { recursive: true, force: true });
    }
  } catch (err) {}
}

const store = {
  messages: new Map(),
  maxPerChat: 20,
  bind: (ev) => {
    ev.on('messages.upsert', ({ messages }) => {
      for (const msg of messages) {
        if (!msg.key?.id) continue;
        const jid = msg.key.remoteJid;
        if (!store.messages.has(jid)) store.messages.set(jid, new Map());
        const chatMsgs = store.messages.get(jid);
        chatMsgs.set(msg.key.id, msg);
        if (chatMsgs.size > store.maxPerChat) {
          const oldestKey = chatMsgs.keys().next().value;
          chatMsgs.delete(oldestKey);
        }
      }
    });
  },
  loadMessage: async (jid, id) => store.messages.get(jid)?.get(id) || null
};

const processedMessages = new Set();
setInterval(() => processedMessages.clear(), 5 * 60 * 1000);

const createSuppressedLogger = (level = 'silent') => {
  return pino({ level });
};

async function startBot() {
  const sessionFolder = `./${config.sessionName}`;
  
  // Gestion automatique du SessionID compressé
  if (config.sessionID && (config.sessionID.startsWith('GhostG-X!') || config.sessionID.startsWith('KnightBot!'))) {
    try {
      const b64data = config.sessionID.split('!')[1];
      if (b64data) {
        const compressedData = Buffer.from(b64data.replace('...', ''), 'base64');
        const decompressedData = zlib.gunzipSync(compressedData);
        if (!fs.existsSync(sessionFolder)) fs.mkdirSync(sessionFolder, { recursive: true });
        fs.writeFileSync(path.join(sessionFolder, 'creds.json'), decompressedData, 'utf8');
        console.log('📡 Session : 🔑 Session chargée avec succès.');
      }
    } catch (e) {
      console.error('📡 Session : ❌ Erreur sessionID:', e.message);
    }
  }

  const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: createSuppressedLogger('silent'),
    printQRInTerminal: false, // Forcer le mode Pairing
    browser: Browsers.ubuntu("Chrome"),
    auth: state,
    syncFullHistory: false,
    downloadHistory: false,
    getMessage: async () => undefined 
  });

  // --- LOGIQUE PAIRING CODE (FORCÉE) ---
  if (!sock.authState.creds.registered) {
    // Si un numéro est fourni dans la config, on demande le code
    const phoneNumber = config.OWNER_NUMBER || config.ownerNumber?.[0];
    
    if (phoneNumber) {
        console.log(`\n⏳ Génération du code de jumelage pour : ${phoneNumber}...`);
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                console.log(`\n╔════════════════════════════════════╗`);
                console.log(`║      VOTRE CODE DE JUMELAGE :      ║`);
                console.log(`║          ${code}          ║`);
                console.log(`╚════════════════════════════════════╝\n`);
            } catch (err) {
                console.error('❌ Erreur Pairing:', err.message);
            }
        }, 3000);
    } else {
        console.log("⚠️ OWNER_NUMBER manquant dans config.js. Impossible de générer le Pairing Code.");
    }
  }

  store.bind(sock.ev);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    // Affiche le QR seulement si aucun numéro n'est configuré
    if (qr && !config.OWNER_NUMBER) {
      console.log('\n📱 Scan ce QR code (Pairing non configuré) :\n');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log(`📡 Connexion perdue. Reconnexion : ${shouldReconnect}`);
      if (shouldReconnect) startBot();
    } else if (connection === 'open') {
      console.log('\n✅ GhostG-X Connecté avec succès !');
      console.log(`📱 Bot : ${sock.user.id.split(':')[0]}`);
      handler.initializeAntiCall(sock);
    }
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const msg of messages) {
      if (!msg.message || processedMessages.has(msg.key.id)) continue;
      processedMessages.add(msg.key.id);
      handler.handleMessage(sock, msg).catch(() => {});
    }
  });

  sock.ev.on('group-participants.update', async (update) => {
    await handler.handleGroupUpdate(sock, update);
  });

  return sock;
}

// Lancement
console.log('🚀 Démarrage de GhostG-X Bot...\n');
cleanupPuppeteerCache();
startBot().catch(err => console.error('Erreur Critique:', err));

process.on('uncaughtException', (err) => {
    if (!err.message.includes('ENOSPC')) console.error(err);
});

module.exports = { store };
