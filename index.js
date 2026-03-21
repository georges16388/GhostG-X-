/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - ᴍᴀɪɴ ᴇɴᴛʀʏ ᴘᴏɪɴᴛ (ᴘʀᴇsᴛɪɢᴇ ᴛᴜʀʙᴏ)
 */

// --- FIX P-QUEUE (REPLACE LES ANCIENNES LIGNES PAR ÇA) ---
let queue;
(async () => {
    try {
        const PQueue = require('p-queue');
        // Si c'est la version 6.x.x
        queue = new (PQueue.default || PQueue)({ concurrency: 1 });
    } catch {
        // Si c'est la version 7.x.x+ (ESM)
        const { default: PQueueLib } = await import('p-queue');
        queue = new PQueueLib({ concurrency: 1 });
    }
})();
// --------------------------------------------------------

process.env.PUPPETEER_SKIP_DOWNLOAD = 'true';
// ... reste de ton code


process.env.PUPPETEER_SKIP_DOWNLOAD = 'true';
process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true';
process.env.PUPPETEER_CACHE_DIR = '/tmp/puppeteer_cache_disabled';

const { initializeTempSystem } = require('./utils/tempManager');
const { startCleanup } = require('./utils/cleanup');
initializeTempSystem();
startCleanup();

const pino = require('pino');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  Browsers,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const config = require('./config');
const handler = require('./handler');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

async function startBot() {
  const sessionFolder = `./${config.sessionName}`;

  // Restauration de session via ID
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
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
    },
    syncFullHistory: false,
    shouldSyncHistoryMessage: () => false,
    keepAliveIntervalMs: 30000
  });

  // Gestion Pairing Code
  if (!sock.authState.creds.registered) {
    const rawNumber = config.supremeNumber || config.OWNER_NUMBER;
    const cleanNumber = String(Array.isArray(rawNumber) ? rawNumber[0] : rawNumber).replace(/\D/g, '');
    if (cleanNumber) {
      console.log(`\n⏳ ɢᴇɴᴇʀᴀᴛɪɴɢ ᴘᴀɪʀɪɴɢ ᴄᴏᴅᴇ...`);
      setTimeout(async () => {
        try {
          let code = await sock.requestPairingCode(cleanNumber);
          code = code?.match(/.{1,4}/g)?.join("-") || code;
          console.log(`\n╔════════════════════════════════════╗\n║      ᴠᴏᴛʀᴇ ᴄᴏᴅᴇ ᴅᴇ ᴊᴜᴍᴇʟᴀɢᴇ :      ║\n║          ${code}          ║\n╚════════════════════════════════════╝\n`);
        } catch (err) { console.error('❌ Pairing Error:', err.message); }
      }, 5000);
    }
  }

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr && !config.supremeNumber) qrcode.generate(qr, { small: true });

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      if (statusCode !== DisconnectReason.loggedOut) {
        console.log(`🔄 Reconnexion en cours...`);
        setTimeout(() => startBot(), 3000);
      }
    } else if (connection === 'open') {
      console.log('\n✅ ɢʜᴏꜱᴛɢ-x ᴄᴏɴɴᴇᴄᴛᴇ́ ᴇᴛ ᴏᴘᴛɪᴍɪsé !');
      handler.initializeAntiCall(sock);

      try {
        const { loadCommands } = require('./utils/commandLoader');
        const totalCmds = loadCommands().size || "103";
        const supremeNum = config.supremeNumber.replace(/\D/g, '');
        const supremeJid = supremeNum + '@s.whatsapp.net';

        // --- DESIGN ALIVE AUTOMATIQUE ---
        const welcomeCaption = `╭╼━≪• *ɢʜᴏsᴛɢ-x ɪs ᴀʟɪᴠᴇ* •≫━╾╮
┃ *sᴛᴀᴛᴜᴛ* : 🟢 ᴏɴʟɪɴᴇ
┃ *ᴍᴀɪᴛʀᴇ* : @${supremeNum}
┃ *ᴘʀᴇғɪxᴇ* : [ ${config.prefix || '.'} ]
┃ *ᴄᴏᴍᴍᴀɴᴅᴇs* : ${totalCmds} ғɪʟᴇs
┃ *ᴍᴏᴅᴇ* : ${config.selfMode ? '🔒 ᴘʀɪᴠé' : '🌐 ᴘᴜʙʟɪᴄ'}
╰━━━━━━━━━━━━━━━━━━━━━━━╯

❓ *ᴘᴏᴜʀ ᴛᴇs ǫᴜᴇsᴛɪᴏɴs* :

📢 *ᴄʜᴀɪɴᴇ ᴡʜᴀᴛsᴀᴘᴘ* :
https://whatsapp.com/channel/0029VbCFj3oKbYMVXaqyHq3c

👥 *ɢʀᴏᴜᴘᴇ ᴅ'ᴇɴᴛʀᴀɪᴅᴇ* :
https://chat.whatsapp.com/JuhRb0BfN9uBkMBQmwZhIf

💻 *ᴅᴇᴠᴇʟᴏᴘᴘᴇᴜʀ* :
https://wa.me/22651622652

📖 _*“ ᴊᴇ ᴘᴜɪs ᴛᴏᴜᴛ ᴘᴀʀ ᴄᴇʟᴜɪ ǫᴜɪ ᴍᴇ ғᴏʀᴛɪғɪᴇ ”*_ - ᴘʜɪʟɪᴘᴘɪᴇɴs 4.13 ❤️✝️

> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-x*`;

        await sock.sendMessage(supremeJid, {
          image: { url: 'https://files.catbox.moe/2fmwpu.jpg' },
          caption: welcomeCaption,
          contextInfo: {
            mentionedJid: [supremeJid],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363425540434745@newsletter',
              newsletterName: "-ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ",
              serverMessageId: 143
            }
          }
        });
      } catch (err) { console.error('❌ Notification Error:', err.message); }
    }
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const msg of messages) {
      if (!msg.message) continue;
      // Utilisation du Turbo P-Queue
      queue.add(() => handler.handleMessage(sock, msg).catch(err => console.error(err)));
    }
  });

  return sock;
}

startBot().catch(err => console.error('❌ Erreur Critique:', err));
