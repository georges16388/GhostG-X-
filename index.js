/**
 * GhostG-X Bot - Main Entry Point
 * Fix: Decrypted message with closed session & Pushname Mentions
 * Prestige Edition - GhostG X
 */
process.env.PUPPETEER_SKIP_DOWNLOAD = 'true';
process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true';
process.env.PUPPETEER_CACHE_DIR = process.env.PUPPETEER_CACHE_DIR || '/tmp/puppeteer_cache_disabled';

const { initializeTempSystem } = require('./utils/tempManager');
const { startCleanup } = require('./utils/cleanup');
initializeTempSystem();
startCleanup();

// --- FILTRAGE DES LOGS CONSOLE ---
const originalConsoleLog = console.log;
const forbiddenPatternsConsole = [
  'closing session', 'sessionentry', 'prekey bundle', 'pendingprekey', 
  'currentratchet', 'chainkey', 'ratchet', 'signal protocol', 'ephemeralkeypair'
];

console.log = (...args) => {
  const message = args.map(a => String(a)).join(' ').toLowerCase();
  if (!forbiddenPatternsConsole.some(p => message.includes(p))) {
    originalConsoleLog.apply(console, args);
  }
};

// --- DÉPENDANCES ---
const pino = require('pino');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  Browsers,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore // INDISPENSABLE POUR FIXER LE BUG DE SESSION
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const config = require('./config');
const handler = require('./handler');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

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
  }
};

const processedMessages = new Set();
setInterval(() => processedMessages.clear(), 5 * 60 * 1000);

const toSmallCaps = (text) => {
  if (!text) return "";
  const fonts = {
    'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ'
  };
  return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

async function startBot() {
  const sessionFolder = `./${config.sessionName}`;

  if (config.sessionID && (config.sessionID.startsWith('GhostG-X!') || config.sessionID.startsWith('KnightBot!'))) {
    try {
      const b64data = config.sessionID.split('!')[1];
      if (b64data) {
        const decompressedData = zlib.gunzipSync(Buffer.from(b64data, 'base64'));
        if (!fs.existsSync(sessionFolder)) fs.mkdirSync(sessionFolder, { recursive: true });
        fs.writeFileSync(path.join(sessionFolder, 'creds.json'), decompressedData);
        console.log('📡 ꜱᴇꜱꜱɪᴏɴ : 🔑 ꜱᴇꜱꜱɪᴏɴ ʀᴇsᴛᴀᴜʀéᴇ.');
      }
    } catch (e) { console.error('❌ Erreur SessionID:', e.message); }
  }

  const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: Browsers.ubuntu("Chrome"),
    auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) // SOLUTION AU BUG DE RÉPONSE
    },
    syncFullHistory: false,
    shouldSyncHistoryMessage: () => false,
    keepAliveIntervalMs: 30000,
    generateHighQualityLinkPreview: true
  });

  if (!sock.authState.creds.registered) {
    const cleanNumber = String(config.supremeNumber || config.OWNER_NUMBER).replace(/\D/g, '');
    if (cleanNumber) {
        console.log(`\n⏳ ɢᴇɴᴇʀᴀᴛɪɴɢ ᴘᴀɪʀɪɴɢ ᴄᴏᴅᴇ ꜰᴏʀ : ${cleanNumber}...`);
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(cleanNumber);
                console.log(`\n╔════════════════════════════════════╗\n║      ᴠᴏᴛʀᴇ ᴄᴏᴅᴇ ᴅᴇ ᴊᴜᴍᴇʟᴀɢᴇ :      ║\n║          ${code?.match(/.{1,4}/g)?.join("-") || code}          ║\n╚════════════════════════════════════╝\n`);
            } catch (err) { console.error('❌ Pairing Error:', err.message); }
        }, 3000);
    }
  }

  store.bind(sock.ev);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr && !config.supremeNumber) {
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) startBot();
    } else if (connection === 'open') {
      console.log('\n✅ ɢʜᴏꜱᴛɢ-x ᴄᴏɴɴᴇᴄᴛᴇ́ !');
      handler.initializeAntiCall(sock);

      try {
        const { loadCommands } = require('./utils/commandLoader');
        const totalCmds = loadCommands().size;
        
        const supremeJid = config.supremeNumber.replace(/\D/g, '') + '@s.whatsapp.net';
        const pushName = sock.user.name || "Master"; // Ton Pushname

        const welcomeCaption = `╭╼━≪• *${toSmallCaps('ghostg-x is alive')}* •≫━╾╮
┃ *${toSmallCaps('statut')}* : 🟢 ᴏɴʟɪɴᴇ
┃ *${toSmallCaps('maitre')}* : @${pushName}
┃ *${toSmallCaps('prefixe')}* : [ ${config.prefix} ]
┃ *${toSmallCaps('commandes')}* : ${totalCmds} ғɪʟᴇs
┃ *${toSmallCaps('mode')}* : ${config.selfMode ? '🔒 ᴘʀɪᴠé' : '🌐 ᴘᴜʙʟɪᴄ'}
╰━━━━━━━━━━━━━━━━━━━━━━━╯

📢 *${toSmallCaps('chaine whatsapp')}* :
https://whatsapp.com/channel/0029VbCFj3oKbYMVXaqyHq3c

📖 _*“ ${toSmallCaps('je puis tout par celui qui me fortifie')} ”*_ - ᴘʜɪʟɪᴘᴘɪᴇɴs 4.13 ❤️✝️

> *${toSmallCaps('powered by ghostg-x')}*`;

        await sock.sendMessage(supremeJid, { 
            image: { url: 'https://files.catbox.moe/2fmwpu.jpg' }, 
            caption: welcomeCaption, 
            mentions: [supremeJid],
            contextInfo: {
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363425540434745@newsletter',
                    newsletterName: "-ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ",
                    serverMessageId: 100
                },
                isForwarded: true,
                forwardingScore: 1
            }
        });

      } catch (err) { console.error('❌ Notification Error:', err.message); }
    }
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const msg of messages) {
      if (!msg.message || processedMessages.has(msg.key.id)) continue;
      processedMessages.add(msg.key.id);
      
      // On passe le pushname au handler si besoin
      handler.handleMessage(sock, msg).catch(() => {});
    }
  });

  return sock;
}

startBot().catch(err => console.error('❌ Erreur Critique:', err));
module.exports = { store };
