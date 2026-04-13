/**
 * WhatsApp MD Bot - Main Entry Point
 * Edition : GhostG-X Fusionnée avec Anti-Crash & Pairing
 * Sécurité : Supreme Owner Master Access
 * Style : Zero-Footprint, Compact & Small Caps
 * Version : 2.3 (getMessage Fix + Console Premium)
 */

process.env.PUPPETEER_SKIP_DOWNLOAD = 'true';
process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true';
process.env.PUPPETEER_CACHE_DIR = process.env.PUPPETEER_CACHE_DIR || '/tmp/puppeteer_cache_disabled';

const { initializeTempSystem } = require('./utils/tempManager');
const { startCleanup } = require('./utils/cleanup');
initializeTempSystem();
startCleanup();

// ==========================================
// FILTRAGE CONSOLE PREMIUM
// Bloque tout le bruit Signal Protocol + Bad MAC
// ==========================================
const originalConsoleLog   = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn  = console.warn;

const forbiddenPatternsConsole = [
  // Signal Protocol
  'closing session', 'closing open session', 'sessionentry',
  'prekey bundle', 'pendingprekey', '_chains', 'registrationid',
  'currentratchet', 'chainkey', 'ratchet', 'signal protocol',
  'ephemeralkeypair', 'indexinfo', 'basekey',
  // Bad MAC & erreurs session
  'bad mac', 'session error', 'session_cipher',
  'decryptwithsessions', 'dodecryptwhispermessage',
  'verifymac', 'queuejob', 'asyncqueueexecutor',
  'libsignal', 'at sessioncipher',
  // Stack traces inutiles
  'node_modules/libsignal',
  'node_modules/@whiskeysockets',
];

const filterConsole = (originalFunc, ...args) => {
  const message = args
    .map(a => typeof a === 'string' ? a : typeof a === 'object' ? JSON.stringify(a) : String(a))
    .join(' ')
    .toLowerCase();
  if (!forbiddenPatternsConsole.some(p => message.includes(p))) {
    originalFunc.apply(console, args);
  }
};

console.log   = (...args) => filterConsole(originalConsoleLog,   ...args);
console.error = (...args) => filterConsole(originalConsoleError, ...args);
console.warn  = (...args) => filterConsole(originalConsoleWarn,  ...args);

// ==========================================
// IMPORTS
// ==========================================
const pino = require('pino');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  Browsers,
  fetchLatestBaileysVersion,
  proto
} = require('@whiskeysockets/baileys');
const config  = require('./config');
const handler = require('./handler');
const fs      = require('fs');
const path    = require('path');
const os      = require('os');

global.ghostgMode = config.ghostgMode;

// ==========================================
// STORE EN MÉMOIRE LÉGER
// Retient les messages récents pour que Baileys
// puisse les retrouver sans afficher
// "Waiting for this message"
// ==========================================
const messageStore = new Map();
const MESSAGE_STORE_TTL = 10 * 60 * 1000; // 10 minutes

function storeMessage(msg) {
  if (!msg?.key?.id || !msg.message) return;
  messageStore.set(msg.key.id, msg);
  // Auto-nettoyage
  setTimeout(() => messageStore.delete(msg.key.id), MESSAGE_STORE_TTL);
}

// ==========================================
// UTILITAIRES
// ==========================================
function cleanupPuppeteerCache() {
  try {
    const cacheDir = path.join(os.homedir(), '.cache', 'puppeteer');
    if (fs.existsSync(cacheDir)) fs.rmSync(cacheDir, { recursive: true, force: true });
  } catch (_) {}
}

const isSystemJid = (jid) =>
  !jid ||
  jid.includes('@broadcast') ||
  jid.includes('status.broadcast') ||
  jid.includes('@newsletter');

// ==========================================
// ANTI-DOUBLON PERSISTANT
// ==========================================
const processedMessages = new Set();

function addProcessedMessage(id) {
  processedMessages.add(id);
  setTimeout(() => processedMessages.delete(id), 30 * 60 * 1000);
}

// ==========================================
// HORODATAGE DE CONNEXION (anti-replay)
// ==========================================
let botReadyTime = Date.now();

// ==========================================
// RECONNEXION AVEC BACKOFF EXPONENTIEL
// ==========================================
let reconnectAttempts = 0;
const MAX_RECONNECT_DELAY = 60000;

function getReconnectDelay() {
  const delay = Math.min(3000 * Math.pow(1.5, reconnectAttempts), MAX_RECONNECT_DELAY);
  reconnectAttempts++;
  return Math.floor(delay);
}

// ==========================================
// DÉMARRAGE DU BOT
// ==========================================
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
    downloadHistory: false,
    markOnlineOnConnect: true,
    keepAliveIntervalMs: 30000,

    // ✅ FIX "Waiting for this message" :
    // On cherche d'abord dans notre store en mémoire.
    // Si introuvable, on retourne un message vide mais structuré
    // pour que Baileys ne déclenche pas le message d'attente WA.
    getMessage: async (key) => {
      const stored = messageStore.get(key.id);
      if (stored?.message) return stored.message;
      // Fallback : message vide structuré — évite le "Waiting for this message"
      // sans poster de texte indésirable dans les groupes
      return proto.Message.fromObject({});
    }
  });

  // ─── STOCKAGE DES MESSAGES (pour getMessage) ────────────
  sock.ev.on('messages.upsert', ({ messages }) => {
    for (const msg of messages) storeMessage(msg);
  });

  // ─── PAIRING CODE ───────────────────────────────────────
  if (!sock.authState.creds.registered) {
    const rawNumber = process.env.PHONE_NUMBER || config.ownerNumber?.[0];

    if (!rawNumber) {
      console.error('\n❌ ERREUR : Aucun numéro trouvé dans config ou variables d\'environnement.');
    } else {
      const cleanNumber = String(rawNumber).replace(/\D/g, '');
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

  // ─── CONNEXION ──────────────────────────────────────────
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, isNewLogin } = update;

    if (connection === 'close') {
      const statusCode      = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      if (shouldReconnect) {
        const delay = getReconnectDelay();
        console.log(`🔄 ʀᴇᴄᴏɴɴᴇxɪᴏɴ ᴅᴇs ᴄɪʀᴄᴜɪᴛs ᴅᴀɴs ${(delay / 1000).toFixed(1)}s... (ᴛᴇɴᴛᴀᴛɪᴠᴇ #${reconnectAttempts})`);
        setTimeout(() => startBot(), delay);
      } else {
        console.log('❌ sᴇssɪᴏɴ ᴅᴇ́ᴄᴏɴɴᴇᴄᴛᴇ́ᴇ ᴍᴀɴᴜᴇʟʟᴇᴍᴇɴᴛ. ʀᴇssᴄᴀɴɴᴇʀ/ʀᴇ́ᴀssᴏᴄɪᴇʀ ʀᴇǫᴜɪs.');
        reconnectAttempts = 0;
      }

    } else if (connection === 'open') {
      botReadyTime      = Date.now();
      reconnectAttempts = 0;

      const ownerNames = Array.isArray(config.ownerName) ? config.ownerName.join(', ') : config.ownerName;
      console.log('╭╼━≪• ɢʜᴏsᴛɢ-𝐗 ɪs ᴀʟɪᴠᴇ •≫━╾╮');
      console.log('╰━━━━━━━━━━━━━━━━━━━━━━━╯');

      const sId     = sock.user.id.split(':')[0];
      const p1      = process.env.PHONE_NUMBER || config.ownerNumber?.[0] || 'Inconnu';
      const cleanP1 = String(p1).replace(/\D/g, '');
      const prefix  = config.prefix || '.';

      // ── Rapport d'initialisation (premier appairage seulement) ──
      if (isNewLogin) {
        const syncMsg =
          `*╭╼━━━≪• ɪɴɪᴛɪᴀʟɪsᴀᴛɪᴏɴ sʏsᴛᴇ̀ᴍᴇ •≫━━━╾╮*\n` +
          `*┃* ⚙️ *ʟᴇ sᴀɴᴄᴛᴜᴀɪʀᴇ ᴇsᴛ ᴇɴ ʟɪɢɴᴇ*\n\n` +
          `*┃* 🤖 *ɪᴅ* : @${sId}\n` +
          `*┃* 👤 *ʜᴏ̂ᴛᴇ* : ${cleanP1}\n` +
          `*┃* 🔣 *ᴘʀᴇ́ғɪxᴇ* : [ ${prefix} ]\n` +
          `*╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯*\n` +
          `> *♰ ɢʜᴏsᴛɢ-𝐗 ♰*`;

        const owners = config.ownerNumber ? config.ownerNumber.slice(0, 2) : [];
        for (const num of owners) {
          try {
            const jid = String(num).replace(/\D/g, '') + '@s.whatsapp.net';
            await sock.sendMessage(jid, { text: syncMsg, mentions: [`${sId}@s.whatsapp.net`] });
            console.log(`✉️ ʀᴀᴘᴘᴏʀᴛ ᴇɴᴠᴏʏᴇ́ ᴀ̀ ${jid}`);
          } catch (_) {
            console.log(`⚠️ ɪᴍᴘᴏssɪʙʟᴇ ᴅ'ᴇɴᴠᴏʏᴇʀ ʟᴇ ʀᴀᴘᴘᴏʀᴛ ᴀ̀ ${num}.`);
          }
        }
      }

      // ── Message de bienvenue ──
      const rawCreatorNum = config.ownerNumber?.[0];
      const creatorLink   = rawCreatorNum
        ? `https://wa.me/${String(rawCreatorNum).replace(/\D/g, '')}`
        : '🔒 Accès restreint';

      const bigWelcomeMessage =
        `╭╼━≪• *ɢʜᴏsᴛɢ-𝐗 ɪs ᴀʟɪᴠᴇ* •≫━╾╮\n` +
        `┃ 🔮 *ᴠɪɢɪʟᴀɴᴄᴇ* : 🟢 ᴇ́ᴠᴇɪʟʟᴇ́\n` +
        `┃ 🤖 *ɴᴏᴍ* : ${config.botName || 'ɢʜᴏsᴛɢ-𝐗'}\n` +
        `┃ ⚡ *ɪɴᴄᴀɴᴛᴀᴛɪᴏɴ* : [ ${prefix} ]\n` +
        `┃ 🗡️ *ᴄᴏᴍᴍᴀɴᴅᴇᴜʀ* : ${ownerNames}\n` +
        `┃ 🔒 *ᴍᴏᴅᴇ* : ${config.selfMode ? '🔒 ᴘʀɪᴠᴇ́' : '🌐 ᴘᴜʙʟɪᴄ'}\n` +
        `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
        `📡 *ᴄᴀɴᴀʟ ᴅᴇ ʟ'ᴏᴍʙʀᴇ* : https://whatsapp.com/channel/0029VbCFj3oKbYMVXaqyHq3c\n\n` +
        `☬ *ʀᴇᴘᴇʀᴇ sᴇᴄʀᴇᴛ* : https://t.me/ghostgxbot\n\n` +
        `♜ *ʟᴇ sᴀɴᴄᴛᴜᴀɪʀᴇ* : https://chat.whatsapp.com/JuhRb0BfN9uBkMBQmwZhIf?mode=gi_t\n\n` +
        `⸙ *ᴘᴀᴄᴛᴇ ᴀᴠᴇᴄ ʟ'ᴀʀᴛɪsᴀɴ* : ${creatorLink}\n\n` +
        `⚔️⃠ "*_ᴀᴜᴄᴜɴᴇ ᴀʀᴍᴇ ғᴏʀɢᴇ́ᴇ ᴄᴏɴᴛʀᴇ ᴄᴇ sᴀɴᴄᴛᴜᴀɪʀᴇ ɴᴇ ᴘᴇᴜᴛ ᴘʀᴏsᴘᴇ́ʀᴇʀ_*"\n\n\n` +
        `♛ *ʟᴇ ɢʀɪᴍᴏɪʀᴇ ᴇsᴛ ᴏᴜᴠᴇʀᴛ ᴇᴛ ᴘʀᴇ̂ᴛ ᴀ̀ ᴛᴇ sᴇʀᴠɪʀ, ᴍᴀɪᴛʀᴇ !*\n\n` +
        `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`;

      try {
        const imagePath = path.join(process.cwd(), 'utils', 'bot_image_6.jpg');
        const myJid     = sId + '@s.whatsapp.net';
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
          await sock.sendMessage(myJid, {
            image: fs.readFileSync(imagePath),
            caption: bigWelcomeMessage,
            contextInfo: newsletterContext
          });
          console.log('✉️ ᴍᴇssᴀɢᴇ ᴅᴇ ᴅᴇ́ᴍᴀʀʀᴀɢᴇ sᴄᴇʟʟᴇ́ ᴇɴᴠᴏʏᴇ́ !');
        } else {
          await sock.sendMessage(myJid, { text: bigWelcomeMessage, contextInfo: newsletterContext });
          console.log('✉️ ᴍᴇssᴀɢᴇ ᴇɴᴠᴏʏᴇ́ ᴇɴ ᴛᴇxᴛᴇ sᴇᴜʟ.');
        }
      } catch (_) {}

      if (config.autoBio) {
        try { await sock.updateProfileStatus(`♛_ᴊᴇsᴜs ᴇsᴛ ʀᴏɪ_♛`); } catch (_) {}
      }

      handler.initializeAntiCall(sock);
    }
  });

  // ─── CREDENTIALS ────────────────────────────────────────
  sock.ev.on('creds.update', saveCreds);

  // ─── MESSAGES ───────────────────────────────────────────
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      if (!msg.message || !msg.key?.id) continue;
      const from = msg.key.remoteJid;
      if (!from || isSystemJid(from)) continue;

      // Anti-doublon mémoire
      if (processedMessages.has(msg.key.id)) continue;
      addProcessedMessage(msg.key.id);

      // Anti-replay post-reconnexion
      const msgTs = (msg.messageTimestamp || 0) * 1000;
      if (msgTs > 0 && msgTs < botReadyTime - 15000) continue;

      try {
        await handler.handleMessage(sock, msg);
      } catch (err) {
        if (!err.message?.includes('rate-overlimit')) {
          console.error('⚠️ ᴇʀʀᴇᴜʀ ᴍᴇssᴀɢᴇ :', err.message);
        }
      }

      if (config.autoRead && from.endsWith('@g.us')) {
        try { await sock.readMessages([msg.key]); } catch (_) {}
      }
    }
  });

  // ─── GROUP UPDATES ──────────────────────────────────────
  sock.ev.on('group-participants.update', async (update) => {
    try { await handler.handleGroupUpdate(sock, update); } catch (_) {}
  });

  return sock;
}

// ==========================================
// LANCEMENT
// ==========================================
cleanupPuppeteerCache();
startBot().catch(() => process.exit(1));

// ==========================================
// GESTION GLOBALE DES ERREURS — VERSION PREMIUM
// ==========================================
const handleGlobalError = (err) => {
  if (!err) return;
  const msg = (err.message || err.toString() || '').toLowerCase();

  // Bad MAC & Signal Protocol — message premium discret
  if (
    msg.includes('bad mac')        ||
    msg.includes('session error')  ||
    msg.includes('libsignal')      ||
    msg.includes('session_cipher') ||
    msg.includes('verifymac')
  ) {
    originalConsoleLog('🔐 ɢʜᴏsᴛɢ-𝐗 › sɪɢɴᴀʟ ʀᴇsʏɴᴄ — ɪɢɴᴏʀᴇ́');
    return;
  }

  // Espace disque épuisé
  if (err?.code === 'ENOSPC' || msg.includes('no space left on device')) {
    try {
      const { cleanupOldFiles } = require('./utils/cleanup');
      cleanupOldFiles();
    } catch (_) {}
    originalConsoleLog('🧹 ɢʜᴏsᴛɢ-𝐗 › ɴᴇᴛᴛᴏʏᴀɢᴇ ᴅ\'ᴜʀɢᴇɴᴄᴇ ᴅᴇ́ᴄʟᴇɴᴄʜᴇ́');
    return;
  }

  // Vraie erreur critique — affichage propre
  originalConsoleError('❌ ɢʜᴏsᴛɢ-𝐗 › ᴇʀʀᴇᴜʀ ᴄʀɪᴛɪǫᴜᴇ :', err.message || err);
};

process.on('uncaughtException',  handleGlobalError);
process.on('unhandledRejection', handleGlobalError);