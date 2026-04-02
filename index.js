/**
 * WhatsApp MD Bot - Main Entry Point
 * Edition : GhostG-X Fusionnée avec Anti-Crash & Pairing
 * Sécurité : Supreme Owner Master Access (Invisible Bypass)
 * Style : Zero-Footprint, Compact & Small Caps
 * Version : 2.0 (Store désactivé pour plus de légèreté)
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
  'closing session', 'closing open session', 'sessionentry',
  'prekey bundle', 'pendingprekey', '_chains', 'registrationid',
  'currentratchet', 'chainkey', 'ratchet', 'signal protocol',
  'ephemeralkeypair', 'indexinfo', 'basekey'
];

const filterConsole = (originalFunc, ...args) => {
  const message = args.map(a => typeof a === 'string' ? a : typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ').toLowerCase();
  if (!forbiddenPatternsConsole.some(pattern => message.includes(pattern))) {
    originalFunc.apply(console, args);
  }
};

console.log = (...args) => filterConsole(originalConsoleLog, ...args);
console.error = (...args) => filterConsole(originalConsoleError, ...args);
console.warn = (...args) => filterConsole(originalConsoleWarn, ...args);

const pino = require('pino');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  Browsers,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const config = require('./config');
const handler = require('./handler');
const fs = require('fs');
const path = require('path');
const os = require('os');

global.ghostgMode = config.ghostgMode;

function cleanupPuppeteerCache() {
  try {
    const home = os.homedir();
    const cacheDir = path.join(home, '.cache', 'puppeteer');
    if (fs.existsSync(cacheDir)) {
      fs.rmSync(cacheDir, { recursive: true, force: true });
    }
  } catch (err) {}
}

// Fonction pour le style Small Caps
function toSmallCaps(text) {
  const normal = "abcdefghijklmnopqrstuvwxyz0123456789";
  const smallCaps = "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ0123456789";
  const cleanedText = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); 
  return cleanedText.split('').map(c => {
    const index = normal.indexOf(c);
    return index !== -1 ? smallCaps[index] : c;
  }).join('');
}

// 🛡️ ANTI-DOUBLON INTELLIGENT (TTL individuel de 25 minutes)
const processedMessages = new Set();
function addProcessedMessage(messageId) {
  processedMessages.add(messageId);
  setTimeout(() => {
    processedMessages.delete(messageId);
  }, 25 * 60 * 1000); // 25 minutes
}

async function startBot() {
  const sessionFolder = `./${config.sessionName}`;
  const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: Browsers.ubuntu('Chrome'), 
    auth: state,
    syncFullHistory: false,
    downloadHistory: true, 
    markOnlineOnConnect: true,
    keepAliveIntervalMs: 30000,
    // 💡 Option 2 appliquée ici : Plus besoin du store !
    getMessage: async (key) => {
      return { conversation: 'GhostG-X' };
    }
  });

  // Le store.bind(sock.ev) a été retiré avec succès ici 🚀

  if (!sock.authState.creds.registered) {
    const rawNumber = process.env.PHONE_NUMBER || config.ownerNumber?.[0] || '22651622652';
    const cleanNumber = String(rawNumber).replace(/\D/g, '');
    if (!cleanNumber) {
      console.error('❌ Numéro introuvable.');
    } else {
      console.log(`\n⏳ Génération du code pairing pour : +${cleanNumber}...`);
      setTimeout(async () => {
        try {
          let code = await sock.requestPairingCode(cleanNumber);
          code = code?.match(/.{1,4}/g)?.join('-') || code;
          console.log('\n╭──────────────────────────────────────╮');
          console.log(`┃  🔑 CODE PAIRING : ${code}          `);
          console.log('┃  Entre ce code dans WhatsApp >       ');
          console.log('┃  Appareils connectés > Associer      ');
          console.log('╰──────────────────────────────────────╯\n');
        } catch (err) {
          console.error('❌ Erreur pairing :', err.message || err);
        }
      }, 3000);
    }
  }

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      if (shouldReconnect) {
        console.log('🔄 Reconnexion des circuits en cours...');
        setTimeout(() => startBot(), 3000);
      } else {
        console.log('❌ Session déconnectée manuellement. Veuillez rescanner/réassocier.');
      }
    } else if (connection === 'open') {
      const ownerNames = Array.isArray(config.ownerName) ? config.ownerName.join(', ') : config.ownerName;

      console.log('╭╼━≪• ɢʜᴏsᴛɢ-𝐗 ɪs ᴀʟɪᴠᴇ •≫━╾╮');
      console.log('╰━━━━━━━━━━━━━━━━━━━━━━━╯');

      const bigWelcomeMessage = 
          `╭╼━≪• *ɢʜᴏsᴛɢ-𝐗 ɪs ᴀʟɪᴠᴇ* •≫━╾╮\n` +
          `┃ 🔮 *ᴠɪɢɪʟᴀɴᴄᴇ* : 🟢 ᴇ́ᴠᴇɪʟʟᴇ́\n` +
          `┃ 🤖 *ɴᴏᴍ* : ${config.botName || 'ɢʜᴏsᴛɢ-𝐗'}\n` +
          `┃ ⚡ *ɪɴᴄᴀɴᴛᴀᴛɪᴏɴ* : [ ${config.prefix || '.'} ]\n` +
          `┃ 🗡️ *ᴄᴏᴍᴍᴀɴᴅᴇᴜʀ* : ${ownerNames}\n` +
          `┃ 🔒 *ᴍᴏᴅᴇ* : ${config.selfMode ? '🔒 ᴘʀɪᴠᴇ́' : '🌐 ᴘᴜʙʟɪᴄ'}\n` +
          `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
          `📡 *ᴄᴀɴᴀʟ ᴅᴇ l'ᴏᴍʙʀᴇ* : https://whatsapp.com/channel/0029VbCFj3oKbYMVXaqyHq3c\n\n` +
          `🦇 *ʀᴇᴘᴇɪʀᴇ sᴇᴄʀᴇᴛ* : https://t.me/ghostgxbot\n\n` +
          `🏰 *ʟᴇ sᴀɴᴄᴛᴜᴀɪʀᴇ* : https://chat.whatsapp.com/JuhRb0BfN9uBkMBQmwZhIf?mode=gi_t\n\n` +
          `📜 *ᴘᴀᴄᴛᴇ ᴀᴠᴇᴄ l'ᴀʀᴛɪsᴀɴ* : https://wa.me/22651622652\n\n` +
          `⚔️ "*_ᴀᴜᴄᴜɴᴇ ᴀʀᴍᴇ ғᴏʀɢᴇ́ᴇ ᴄᴏɴᴛʀᴇ ᴄᴇ sᴀɴᴄᴛᴜᴀɪʀᴇ ɴᴇ ᴘᴇᴜᴛ ᴘʀᴏsᴘᴇ́ʀᴇʀ_*"\n\n\n` +
          `👑 *ʟᴇ ɢʀɪᴍᴏɪʀᴇ ᴇsᴛ ᴏᴜᴠᴇʀᴛ ᴇᴛ ᴘʀᴇ̂ᴛ ᴀ̀ ᴛᴇ sᴇʀᴠɪʀ, ᴍᴀɪᴛʀᴇ !*\n\n` +
          `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`;

      try {
        const myJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const imagePath = path.join(process.cwd(), 'utils', 'bot_image_6.jpg');

        const newsletterContext = {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363425540434745@newsletter',
            serverMessageId: 100,
            newsletterName: 'ɢʜᴏsᴛɢ-𝐗'
          }
        };

        if (fs.existsSync(imagePath)) {
          const imageBuffer = fs.readFileSync(imagePath);
          await sock.sendMessage(myJid, { 
            image: imageBuffer, 
            caption: bigWelcomeMessage,
            contextInfo: newsletterContext
          });
          console.log('✉️ Message de démarrage scellé envoyé !');
        } else {
          await sock.sendMessage(myJid, { 
            text: bigWelcomeMessage,
            contextInfo: newsletterContext
          });
          console.log('✉️ Message envoyé en texte seul.');
        }
      } catch (err) {
        console.log('⚠️ Impossible d\'envoyer le message de démarrage.', err);
      }

      if (config.autoBio) {
        try {
          await sock.updateProfileStatus(`*ɢʜᴏsᴛɢ-𝐗* | *♛ᴊᴇsᴜs ᴇsᴛ ʀᴏɪ♛*`);
        } catch (e) {}
      }

      handler.initializeAntiCall(sock);
    }
  });

  sock.ev.on('creds.update', saveCreds);

  const isSystemJid = (jid) => !jid || jid.includes('@broadcast') || jid.includes('status.broadcast') || jid.includes('@newsletter');

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      if (!msg.message || !msg.key?.id) continue;
      const from = msg.key.remoteJid;
      if (!from || isSystemJid(from)) continue;

      if (processedMessages.has(msg.key.id)) continue;
      addProcessedMessage(msg.key.id);

      const MESSAGE_AGE_LIMIT = 5 * 60 * 1000; 
      if (msg.messageTimestamp) {
        const messageAge = Date.now() - (msg.messageTimestamp * 1000);
        if (messageAge > MESSAGE_AGE_LIMIT) continue;
      }

      try {
        await handler.handleMessage(sock, msg);
      } catch (err) {
        console.error('Error handling message:', err.message);
      }

      if (config.autoRead && from.endsWith('@g.us')) {
        try { await sock.readMessages([msg.key]); } catch (e) { }
      }
    }
  });

  sock.ev.on('group-participants.update', async (update) => {
    try { await handler.handleGroupUpdate(sock, update); } catch (e) {}
  });

  return sock;
}

cleanupPuppeteerCache();
startBot().catch(err => { process.exit(1); });

const handleNoSpaceError = (err) => {
  if (err.code === 'ENOSPC' || err.message?.includes('no space left on device')) {
    const { cleanupOldFiles } = require('./utils/cleanup');
    cleanupOldFiles();
  }
};

process.on('uncaughtException', handleNoSpaceError);
process.on('unhandledRejection', handleNoSpaceError);

// Retrait de la ligne module.exports = { store }; puisqu'on n'exporte plus le store !
