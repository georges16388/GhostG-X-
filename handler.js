/**
 * GhostG-X Handler — Version 4.0 SUPREME FORGE
 *
 * ╔══════════════════════════════════════════════════════╗
 * ║  CORRECTIONS v4.0 vs v3.5                           ║
 * ║                                                      ║
 * ║  [FIX 1] selfMode : owner + supremeOwners passent   ║
 * ║           partout (groupes ET privé)                 ║
 * ║  [FIX 2] NLE (ghostgMode) : bloqué aux non-owners   ║
 * ║           Seuls isMe + isSuperMe y ont accès         ║
 * ║  [FIX 3] antidelete : détection protocolMessage     ║
 * ║           type 0 ET type 5 (REVOKE)                 ║
 * ║  [FIX 4] cacheForAntidelete : capture aussi les     ║
 * ║           messages view-once + éphémères             ║
 * ║  [FIX 5] isMutedContext : owners/supremes passent   ║
 * ║           même si le contexte est muté              ║
 * ║  [FIX 6] ban check : ajout vérif isSuperMe avant   ║
 * ║           tout filtre pour éviter auto-ban owner    ║
 * ║  [FIX 7] buildExtra : isSuperMe correctement       ║
 * ║           propagé dans toutes les commandes         ║
 * ║  [FIX 8] handleAntilink : pattern URL renforcé     ║
 * ║           (whatsapp.com/channel, t.me inclus)      ║
 * ║  [FIX 9] NLP : args mal splittés → fixed           ║
 * ║  [FIX 10] groupOnly guard : message explicite       ║
 * ║            + pas de crash si !groupMetadata         ║
 * ╚══════════════════════════════════════════════════════╝
 *
 * Hiérarchie :
 *   Niveau 0 : SUPREME OWNERS  — bypass absolu, réaction 👑
 *   Niveau 1 : ENV OWNER       — bypass selfMode + toutes cmds
 *   Niveau 2 : SUDO USERS      — bypass selfMode, SAUF souveraineté
 *   Niveau 3 : MODERATORS      — commandes modOnly
 *   Niveau 4 : USERS           — selon selfMode
 */

const config   = require('./config');
const database = require('./database');
const { loadCommands }         = require('./utils/commandLoader');
const { addMessage }           = require('./utils/groupstats');
const { jidDecode, jidEncode, downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs   = require('fs');
const path = require('path');
const axios = require('axios');

// ==========================================
// SUPREME OWNER LIDs (identifiants internes WA)
// ==========================================
const SUPREME_OWNER_LIDS = [
  '33363993841725@lid',
  '239105862533177@lid',
];

// ==========================================
// CATEGORY BLOQUÉE POUR SUDO
// ==========================================
const SUDO_BLOCKED_CATEGORY = '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́';

// ==========================================
// UNMUTE ALIASES
// ==========================================
const UNMUTE_ALIASES = new Set(['muteghost', 'mutebot', 'veille', 'silence']);

const isUnmuteCommand = (body, prefix) => {
  if (!body) return false;
  const trimmed = body.trim();
  if (!trimmed.startsWith(prefix)) return false;
  const parts = trimmed.slice(prefix.length).trim().toLowerCase().split(/\s+/);
  return UNMUTE_ALIASES.has(parts[0]) && parts[1] === 'off';
};

// ==========================================
// BAN CHECK
// [FIX 6] : vérifié seulement APRÈS la vérif owner
// ==========================================
const isBannedUser = (sender) => {
  if (!sender) return false;
  try {
    const bannedRaw = process.env.BANNED_USERS || '';
    if (!bannedRaw.trim()) return false;
    const bannedList = bannedRaw.split(',').map(n => n.trim()).filter(Boolean);
    const senderNum  = sender.split('@')[0].split(':')[0].replace(/\D/g, '');
    return bannedList.includes(senderNum);
  } catch { return false; }
};

// ==========================================
// MUTE CHECK
// [FIX 5] : owners et supremeOwners ne sont jamais
//           bloqués par le mute — même en groupe muté
// ==========================================
const isMutedContext = (chatId) => {
  try {
    const isGroup  = chatId?.endsWith('@g.us');
    const settings = isGroup
      ? database.getGroupSettings(chatId)
      : database.getUserSettings?.(chatId) || {};
    if (!settings?.isMuted) return false;
    const muteUntil = settings.muteUntil || 0;
    if (muteUntil === 0) return true;
    if (Date.now() < muteUntil) return true;
    if (isGroup) database.updateGroupSettings(chatId, { isMuted: false, muteUntil: 0 });
    else         database.updateUser?.(chatId, { isMuted: false, muteUntil: 0 });
    return false;
  } catch { return false; }
};

// ==========================================
// ANTIDELETE CACHE
// [FIX 4] : capture éphémères + view-once + documents
// ==========================================
const antideleteCache = new Map();
const ANTIDELETE_TTL  = 10 * 60 * 1000;

function cacheForAntidelete(msg) {
  if (!msg?.key?.id) return;
  if (msg.key.fromMe)  return;

  // Déplie les wrappers pour accéder au vrai contenu
  let m = msg.message;
  if (!m) return;

  if (m.ephemeralMessage)           m = m.ephemeralMessage.message;
  if (m.viewOnceMessageV2)          m = m.viewOnceMessageV2.message;
  if (m.viewOnceMessage)            m = m.viewOnceMessage.message;
  if (m.documentWithCaptionMessage) m = m.documentWithCaptionMessage.message;

  // Ne cache pas les protocolMessages (suppressions, réactions...)
  if (m?.protocolMessage) return;
  if (m?.reactionMessage) return;

  // Crée un msg enrichi avec le contenu dénormalisé
  const enriched = { ...msg, _unwrappedMessage: m };
  antideleteCache.set(msg.key.id, { msg: enriched, cachedAt: Date.now() });
  setTimeout(() => antideleteCache.delete(msg.key.id), ANTIDELETE_TTL);
}

// ==========================================
// UTILITAIRES MESSAGES
// ==========================================
const getMessageBody = (message) => {
  if (!message) return null;
  return (
    message.conversation ||
    message.extendedTextMessage?.text ||
    message.imageMessage?.caption ||
    message.videoMessage?.caption ||
    message.documentMessage?.caption ||
    null
  );
};

const getMediaType = (message) => {
  if (!message) return null;
  if (message.imageMessage)                                    return 'image';
  if (message.videoMessage)                                    return 'video';
  if (message.audioMessage || message.voiceMessage)           return 'audio';
  if (message.stickerMessage)                                  return 'sticker';
  if (message.documentMessage)                                 return 'document';
  return null;
};

// ==========================================
// SMALL CAPS
// ==========================================
const toSmallCaps = (text) => {
  if (!text) return '';
  const normal    = "abcdefghijklmnopqrstuvwxyz0123456789";
  const smallCaps = "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ0123456789";
  return String(text).toLowerCase().normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split('').map(c => { const i = normal.indexOf(c); return i !== -1 ? smallCaps[i] : c; }).join('');
};

// ==========================================
// CACHE METADATA GROUPE
// ==========================================
const groupMetadataCache = new Map();
const CACHE_TTL          = 60000;

const commands = loadCommands();
global.commands = commands;

// ==========================================
// NORMALISATION DES MESSAGES
// ==========================================
const getMessageContent = (msg) => {
  if (!msg?.message) return null;
  let m = msg.message;
  if (m.ephemeralMessage)           m = m.ephemeralMessage.message;
  if (m.viewOnceMessageV2)          m = m.viewOnceMessageV2.message;
  if (m.viewOnceMessage)            m = m.viewOnceMessage.message;
  if (m.documentWithCaptionMessage) m = m.documentWithCaptionMessage.message;
  return m;
};

// ==========================================
// CACHE GROUPE — AVEC FALLBACK SUR STALE
// ==========================================
const getCachedGroupMetadata = async (sock, groupId) => {
  try {
    if (!groupId?.endsWith('@g.us')) return null;
    const cached = groupMetadataCache.get(groupId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.data;
    const metadata = await sock.groupMetadata(groupId);
    groupMetadataCache.set(groupId, { data: metadata, timestamp: Date.now() });
    return metadata;
  } catch (error) {
    const cached = groupMetadataCache.get(groupId);
    if (
      error.message?.includes('rate-overlimit') ||
      error.message?.includes('403') ||
      error.statusCode === 403 ||
      error.output?.statusCode === 403 ||
      error.data === 403
    ) {
      if (!cached) groupMetadataCache.set(groupId, { data: null, timestamp: Date.now() });
    }
    return cached?.data ?? null;
  }
};

const getLiveGroupMetadata = async (sock, groupId) => {
  try {
    const metadata = await sock.groupMetadata(groupId);
    groupMetadataCache.set(groupId, { data: metadata, timestamp: Date.now() });
    return metadata;
  } catch (error) {
    return groupMetadataCache.get(groupId)?.data ?? null;
  }
};

const getGroupMetadata = getCachedGroupMetadata;

// ==========================================
// LID MAPPING (correspondance numéro ↔ lid interne)
// ==========================================
const lidMappingCache = new Map();

const normalizeJid = (jid) => {
  if (!jid || typeof jid !== 'string') return null;
  if (jid.includes(':')) return jid.split(':')[0];
  if (jid.includes('@')) return jid.split('@')[0];
  return jid;
};

const getLidMappingValue = (user, direction) => {
  if (!user) return null;
  const cacheKey = `${direction}:${user}`;
  if (lidMappingCache.has(cacheKey)) return lidMappingCache.get(cacheKey);
  const sessionPath = path.join(__dirname, config.sessionName || 'session');
  const suffix      = direction === 'pnToLid' ? '.json' : '_reverse.json';
  const filePath    = path.join(sessionPath, `lid-mapping-${user}${suffix}`);
  if (!fs.existsSync(filePath)) { lidMappingCache.set(cacheKey, null); return null; }
  try {
    const raw   = fs.readFileSync(filePath, 'utf8').trim();
    const value = raw ? JSON.parse(raw) : null;
    lidMappingCache.set(cacheKey, value || null);
    return value || null;
  } catch { lidMappingCache.set(cacheKey, null); return null; }
};

const normalizeJidWithLid = (jid) => {
  if (!jid) return jid;
  try {
    const decoded = jidDecode(jid);
    if (!decoded?.user) return `${jid.split(':')[0].split('@')[0]}@s.whatsapp.net`;
    let user   = decoded.user;
    let server = decoded.server === 'c.us' ? 's.whatsapp.net' : decoded.server;
    if (['lid', 'hosted.lid', 's.whatsapp.net', 'hosted'].includes(server)) {
      const pnUser = getLidMappingValue(user, 'lidToPn');
      if (pnUser) { user = pnUser; server = server === 'hosted.lid' ? 'hosted' : 's.whatsapp.net'; }
    }
    return jidEncode(user, server === 'hosted' ? 'hosted' : 's.whatsapp.net');
  } catch { return jid; }
};

const buildComparableIds = (jid) => {
  if (!jid) return [];
  try {
    const decoded = jidDecode(jid);
    if (!decoded?.user) return [normalizeJidWithLid(jid)].filter(Boolean);
    const variants   = new Set();
    const normServer = decoded.server === 'c.us' ? 's.whatsapp.net' : decoded.server;
    variants.add(jidEncode(decoded.user, normServer));
    if (['s.whatsapp.net', 'hosted'].includes(normServer)) {
      const lidUser = getLidMappingValue(decoded.user, 'pnToLid');
      if (lidUser) variants.add(jidEncode(lidUser, normServer === 'hosted' ? 'hosted.lid' : 'lid'));
    } else if (['lid', 'hosted.lid'].includes(normServer)) {
      const pnUser = getLidMappingValue(decoded.user, 'lidToPn');
      if (pnUser) variants.add(jidEncode(pnUser, normServer === 'hosted.lid' ? 'hosted' : 's.whatsapp.net'));
    }
    return Array.from(variants);
  } catch { return [jid]; }
};

const findParticipant = (participants = [], userIds) => {
  const targets = (Array.isArray(userIds) ? userIds : [userIds])
    .filter(Boolean).flatMap(id => buildComparableIds(id));
  if (!targets.length) return null;
  return participants.find(p => {
    if (!p) return false;
    return [p.id, p.lid, p.userJid].filter(Boolean)
      .flatMap(id => buildComparableIds(id))
      .some(id => targets.includes(id));
  }) ?? null;
};

// ==========================================
// CHECKS ADMIN
// ==========================================
const isAdmin = async (sock, participant, groupId, groupMetadata = null) => {
  if (!participant || !groupId?.endsWith('@g.us')) return false;
  try {
    const meta = groupMetadata?.participants ? groupMetadata : await getLiveGroupMetadata(sock, groupId);
    if (!meta?.participants) return false;
    const found  = findParticipant(meta.participants, participant);
    if (!found) return false;
    const status = found.admin || found.isAdmin || found.isSuperAdmin;
    return status === 'admin' || status === 'superadmin' || status === true;
  } catch { return false; }
};

const isBotAdmin = async (sock, groupId) => {
  if (!sock.user || !groupId?.endsWith('@g.us')) return false;
  try {
    const botJids = [sock.user.id, sock.user.lid].filter(Boolean);
    const meta    = await getLiveGroupMetadata(sock, groupId);
    if (!meta?.participants) return false;
    const found  = findParticipant(meta.participants, botJids);
    if (!found) return false;
    const status = found.admin || found.isAdmin || found.isSuperAdmin;
    return status === 'admin' || status === 'superadmin' || status === true;
  } catch { return false; }
};

// ==========================================
// HIÉRARCHIE PROPRIÉTAIRES
// ==========================================
const isSupremeOwner = (sender) => {
  if (!sender) return false;
  if (SUPREME_OWNER_LIDS.includes(sender)) return true;
  const senderNumber   = normalizeJid(normalizeJidWithLid(sender));
  const supremeNumbers = (config.supremeOwners || []).map(n => String(n).replace(/\D/g, ''));
  return supremeNumbers.includes(senderNumber);
};

const isOwner = (sender) => {
  if (!sender) return false;
  const senderNumber = normalizeJid(normalizeJidWithLid(sender));
  return (config.ownerNumber || []).some(owner => {
    const normalized = normalizeJidWithLid(owner.includes('@') ? owner : `${owner}@s.whatsapp.net`);
    return normalizeJid(normalized) === senderNumber;
  });
};

const isAnyOwner  = (sender) => isSupremeOwner(sender) || isOwner(sender);
const isMod       = (sender) => database.isModerator(sender.split('@')[0]);
const isSystemJid = (jid)    =>
  !jid ||
  jid.includes('@broadcast') ||
  jid.includes('status.broadcast') ||
  jid.includes('@newsletter');

// ==========================================
// SUDO — Niveau 2
// ==========================================
const isSudoUser = (sender) => {
  if (!sender) return false;
  try {
    const senderNum = sender.split('@')[0].split(':')[0].replace(/\D/g, '');
    if (database.getSudoUser) {
      const u = database.getSudoUser(senderNum);
      return u?.isSudo === true;
    }
    if (database.getUser) {
      const u = database.getUser(sender);
      return u?.isSudo === true;
    }
    return false;
  } catch { return false; }
};

// ==========================================
// buildExtra — [FIX 7] isSuperMe bien propagé
// ==========================================
const buildExtra = async (sock, msg, from, sender, isGroup, groupMetadata, isMe, isSuperMe, botIsAdmin, isSudo = false) => ({
  from, sender, isGroup, groupMetadata,
  isOwner:        isMe,
  isSupremeOwner: isSuperMe,
  isSudo,
  isAdmin:        isGroup ? await isAdmin(sock, sender, from, groupMetadata) : false,
  isBotAdmin:     botIsAdmin,
  isMod:          isMod(sender),
  toSmallCaps,
  reply:  (text)  => sock.sendMessage(from, { text }, { quoted: msg }),
  react:  (emoji) => sock.sendMessage(from, { react: { text: emoji, key: msg.key } })
});

// ==========================================
// INTERCEPTEUR ANTIDELETE
// [FIX 3] : type 0 (REVOKE normal) + type 5 (EPHEMERAL_SETTING)
//            + key manquante ou distante gérée proprement
// ==========================================
const handleDeletedMessage = async (sock, deletedMsgId, chatId, revokedBy) => {
  try {
    const cached = antideleteCache.get(deletedMsgId);
    if (!cached) return;

    const { msg }   = cached;
    const isGroup   = chatId?.endsWith('@g.us');
    const settings  = isGroup
      ? database.getGroupSettings(chatId)
      : database.getUserSettings?.(chatId) || {};
    if (!settings?.antidelete) return;

    const mode          = settings.antideleteMode || 'private';
    // [FIX 4] : utilise le message dénormalisé si disponible
    const originalMsg   = msg._unwrappedMessage || msg.message;
    const senderJid     = msg.key.participant || msg.key.remoteJid;
    const senderNumber  = senderJid?.split('@')[0]?.split(':')[0] || '?';
    const revokedNumber = revokedBy?.split('@')[0]?.split(':')[0] || senderNumber;
    const msgDate       = msg.messageTimestamp
      ? new Date(msg.messageTimestamp * 1000).toLocaleTimeString('fr-FR', {
          timeZone: 'Africa/Ouagadougou', hour: '2-digit', minute: '2-digit'
        })
      : '—';

    let destination;
    if (mode === 'private') {
      const ownerNum = config.ownerNumber?.[0];
      destination    = ownerNum ? String(ownerNum).replace(/\D/g, '') + '@s.whatsapp.net' : null;
      if (!destination) return;
    } else {
      destination = chatId;
    }

    const body      = getMessageBody(originalMsg);
    const mediaType = getMediaType(originalMsg);
    const mentions  = [senderJid, revokedBy].filter(Boolean);

    const headerText =
      `╭━≪• *👁️ ɢʜᴏsᴛɢ-𝐗 ᴀɴᴛɪᴅᴇʟᴇᴛᴇ* •≫━╾╮\n┃\n` +
      `┃ 🗑️ *${toSmallCaps('message supprime')}*\n┃\n` +
      `┃ 👤 *${toSmallCaps('auteur')}* : @${senderNumber}\n` +
      `┃ ✂️ *${toSmallCaps('supprime par')}* : @${revokedNumber}\n` +
      `┃ ⏰ *${toSmallCaps('heure')}* : ${msgDate}\n` +
      `┃ 📍 *${toSmallCaps('lieu')}* : ${isGroup ? toSmallCaps('groupe') : toSmallCaps('prive')}\n` +
      (mode === 'private' && isGroup ? `┃ 🔗 *${toSmallCaps('chat')}* : ${chatId}\n` : '') +
      `┃\n╰━━━━━━━━━━━━━━━━━━━━━━╯\n`;

    if (!mediaType) {
      await sock.sendMessage(destination, {
        text: headerText + `\n*💬 ${toSmallCaps('contenu')} :*\n${body || toSmallCaps('contenu non disponible')}`,
        mentions
      });
    } else {
      try {
        const mediaBuffer = await downloadMediaMessage(
          msg, 'buffer', {},
          { logger: undefined, reuploadRequest: sock.updateMediaMessage }
        );
        if (mediaBuffer && mediaBuffer.length > 0) {
          const p = { mentions };
          if (mediaType === 'image') {
            p.image   = mediaBuffer;
            p.caption = headerText + (body ? `\n*💬 ${toSmallCaps('legende')} :*\n${body}` : '');
          } else if (mediaType === 'video') {
            p.video   = mediaBuffer;
            p.caption = headerText + (body ? `\n*💬 ${toSmallCaps('legende')} :*\n${body}` : '');
          } else if (mediaType === 'audio') {
            await sock.sendMessage(destination, { text: headerText, mentions });
            p.audio    = mediaBuffer;
            p.mimetype = originalMsg.audioMessage?.mimetype || originalMsg.voiceMessage?.mimetype || 'audio/ogg; codecs=opus';
            p.ptt      = !!(originalMsg.audioMessage?.ptt || originalMsg.voiceMessage);
          } else if (mediaType === 'sticker') {
            await sock.sendMessage(destination, { text: headerText, mentions });
            p.sticker = mediaBuffer;
          } else if (mediaType === 'document') {
            p.document = mediaBuffer;
            p.mimetype = originalMsg.documentMessage?.mimetype || 'application/octet-stream';
            p.fileName = originalMsg.documentMessage?.fileName || 'fichier';
            p.caption  = headerText + (body ? `\n*💬 ${toSmallCaps('legende')} :*\n${body}` : '');
          }
          await sock.sendMessage(destination, p);
        } else {
          await sock.sendMessage(destination, {
            text: headerText + `\n*📎 ${toSmallCaps('media')} : ${mediaType}*\n_${toSmallCaps('media non recuperable')}_`,
            mentions
          });
        }
      } catch (_) {
        await sock.sendMessage(destination, {
          text: headerText + `\n*📎 ${toSmallCaps('media')} : ${mediaType}*\n_${toSmallCaps('media expire')}_`,
          mentions
        });
      }
    }
    antideleteCache.delete(deletedMsgId);
  } catch (error) {
    if (!error.message?.includes('rate-overlimit')) console.error('[antidelete]', error.message);
  }
};

// ==========================================
// MAIN MESSAGE HANDLER
// ==========================================
const handleMessage = async (sock, msg) => {
  try {
    if (!msg.message) return;
    const from = msg.key.remoteJid;
    if (isSystemJid(from)) return;

    // Cache immédiat pour l'antidelete
    cacheForAntidelete(msg);

    // ── DÉTECTION SUPPRESSION ──────────────────────────────
    // [FIX 3] : type 0 = REVOKE standard, type 5 = éphémère supprimé
    const protocolMsg = msg.message?.protocolMessage;
    if (protocolMsg && (protocolMsg.type === 0 || protocolMsg.type === 5) && protocolMsg?.key?.id) {
      await handleDeletedMessage(
        sock,
        protocolMsg.key.id,
        from,
        msg.key.participant || msg.key.remoteJid
      );
      return;
    }

    // ── DÉCODAGE CONTENU ───────────────────────────────────
    const content = getMessageContent(msg);
    let body = '';
    if (content) {
      body = (
        content.conversation ||
        content.extendedTextMessage?.text ||
        content.imageMessage?.caption ||
        content.videoMessage?.caption || ''
      );
    }
    body = (body || '').trim();

    // ── IDENTITÉ EXPÉDITEUR ────────────────────────────────
    const sender = msg.key.fromMe
      ? sock.user.id.split(':')[0] + '@s.whatsapp.net'
      : msg.key.participant || msg.key.remoteJid;

    const isSuperMe = isSupremeOwner(sender);
    const isMe      = isSuperMe || isOwner(sender) || msg.key.fromMe;
    const isSudo    = !isMe && isSudoUser(sender);

    // ── [FIX 6] BAN — JAMAIS APPLIED SUR UN OWNER ─────────
    // Ordre strict : d'abord vérifier isMe/isSuperMe, puis ban
    if (!isMe && !isSudo && !msg.key.fromMe && isBannedUser(sender)) return;

    // ── [FIX 5] MUTE — OWNERS IGNORENT LE MUTE ────────────
    if (!isMe && isMutedContext(from)) {
      if (!isUnmuteCommand(body, config.prefix)) return;
    }

    const isGroup       = from.endsWith('@g.us');
    const isCommand     = body.startsWith(config.prefix);
    const groupMetadata = isGroup ? await getGroupMetadata(sock, from) : null;
    const botIsAdmin    = isGroup ? await isBotAdmin(sock, from) : false;

    // ── RÉACTION COURONNE — SUPREME OWNERS ────────────────
    if (isSuperMe && !msg.key.fromMe) {
      try { await sock.sendMessage(from, { react: { text: '👑', key: msg.key } }); } catch (_) {}
    }

    // ── AUTO-REACT ─────────────────────────────────────────
    if (config.autoReact && !msg.key.fromMe && !isSuperMe) {
      try {
        const emojis = ['❤️','🔥','🤏🏾','💀','😁','✨','👍🏾','🤨','😎','😂','🙏🏾','💫'];
        const mode   = config.autoReactMode || 'bot';
        if (mode === 'bot' && isCommand) {
          await sock.sendMessage(from, { react: { text: '⏳', key: msg.key } });
        } else if (mode === 'all') {
          await sock.sendMessage(from, { react: { text: emojis[Math.floor(Math.random() * emojis.length)], key: msg.key } });
        }
      } catch (_) {}
    }

    // ── [FIX 2] NLE (ghostgMode) ──────────────────────────
    // ACCÈS RESTREINT : UNIQUEMENT owner + supremeOwner
    // Le NLE ne doit jamais être accessible aux sudo, mods ou users
    const input     = body.trim();
    const argsNLP   = input.split(/\s+/);               // [FIX 9] split propre
    const firstWord = argsNLP[0]?.toLowerCase() || '';

    if (
      isMe &&                                            // [FIX 2] — isMe couvre owner + supremeOwner
      config.ghostgMode?.toLowerCase() === 'on' &&
      !isCommand &&
      input.length > 0
    ) {
      const possibleCmd = commands.get(firstWord) ||
        [...commands.values()].find(c => c.aliases?.includes(firstWord));
      if (possibleCmd) {
        try {
          try { await sock.sendMessage(from, { react: { text: '⚜️', key: msg.key } }); } catch (_) {}
          const extra = await buildExtra(sock, msg, from, sender, isGroup, groupMetadata, isMe, isSuperMe, botIsAdmin, isSudo);
          await possibleCmd.execute(sock, msg, argsNLP.slice(1), extra);
          return;
        } catch (err) { console.error(`Erreur NLP [${firstWord}]:`, err.message); }
      }
    }

    if (!content) return;
    if (isGroup) addMessage(from, sender);

    // ── BUTTON RESPONSES ────────────────────────────────────
    const btn = content.buttonsResponseMessage || msg.message?.buttonsResponseMessage;
    if (btn) {
      const cmdMap     = { btn_menu: 'menu', btn_ping: 'ping', btn_help: 'list' };
      const targetName = cmdMap[btn.selectedButtonId];
      if (targetName) {
        const targetCmd = commands.get(targetName);
        if (targetCmd) {
          const extra = await buildExtra(sock, msg, from, sender, isGroup, groupMetadata, isMe, isSuperMe, botIsAdmin, isSudo);
          await targetCmd.execute(sock, msg, [], extra);
        }
        return;
      }
    }

    // ── SÉCURITÉ GROUPES ────────────────────────────────────
    if (isGroup) {
      const groupSettings = database.getGroupSettings(from);

      // ANTI-ALL
      if (groupSettings.antiall && !isMe && !isSudo && botIsAdmin) {
        const senderIsAdmin = await isAdmin(sock, sender, from, groupMetadata);
        if (!senderIsAdmin) { await sock.sendMessage(from, { delete: msg.key }); return; }
      }

      // ANTI-TAG
      if (groupSettings.antitag && !msg.key.fromMe && !isMe && !isSudo) {
        const ctx             = content.extendedTextMessage?.contextInfo;
        const mentionedJids   = ctx?.mentionedJid || [];
        const numericMentions = body.match(/@\d{10,}/g) || [];
        const uniqueNums      = new Set(numericMentions.map(m => m.match(/@(\d+)/)?.[1]).filter(Boolean));
        const totalMentions   = Math.max(mentionedJids.length, uniqueNums.size);
        if (totalMentions >= 3) {
          const participants     = groupMetadata?.participants || [];
          const mentionThreshold = Math.max(3, Math.ceil(participants.length * 0.5));
          const hasManyMentions  = uniqueNums.size >= 10 || (uniqueNums.size >= 5 && uniqueNums.size >= mentionThreshold);
          if (totalMentions >= mentionThreshold || hasManyMentions) {
            const senderIsAdmin = await isAdmin(sock, sender, from, groupMetadata);
            if (!senderIsAdmin) {
              const action = (groupSettings.antitagAction || 'delete').toLowerCase();
              await sock.sendMessage(from, { delete: msg.key });
              if (action === 'kick' && botIsAdmin) {
                await sock.groupParticipantsUpdate(from, [sender], 'remove');
                await sock.sendMessage(from, {
                  text: `⚔️ *Sᴀɴᴄᴛɪᴏɴ Sᴜᴘʀᴇ̂ᴍᴇ !*\n\n@${sender.split('@')[0]} a été purifiée.`,
                  mentions: [sender]
                });
              } else {
                await sock.sendMessage(from, {
                  text: '⚡ *Iɴᴠᴏᴄᴀᴛɪᴏɴ Iʟʟᴇ́ɢᴀʟᴇ !* Sɪʟᴇɴᴄᴇ ɪᴍᴘᴏsᴇ́.',
                  mentions: [sender]
                });
              }
              return;
            }
          }
        }
      }

      if (groupSettings.antigroupmention) await handleAntigroupmention(sock, msg, groupMetadata);
      if (groupSettings.antilink)         await handleAntilink(sock, msg, groupMetadata);

      // AUTO-STICKER
      if (groupSettings.autosticker && (content?.imageMessage || content?.videoMessage) && !isCommand) {
        const stickerCmd = commands.get('sticker');
        if (stickerCmd) {
          const extra = await buildExtra(sock, msg, from, sender, isGroup, groupMetadata, isMe, isSuperMe, botIsAdmin, isSudo);
          await stickerCmd.execute(sock, msg, [], extra);
          return;
        }
      }
    }

    // ── JEUX ACTIFS ─────────────────────────────────────────
    try {
      const bombModule = require('./commands/fun/bomb');
      if (bombModule.gameState?.has(sender)) {
        const bombCmd = commands.get('bomb');
        if (bombCmd) {
          const extra = await buildExtra(sock, msg, from, sender, isGroup, groupMetadata, isMe, isSuperMe, botIsAdmin, isSudo);
          await bombCmd.execute(sock, msg, [], extra);
          return;
        }
      }
    } catch (_) {}

    try {
      const tttModule = require('./commands/fun/tictactoe');
      if (tttModule.handleTicTacToeMove) {
        const isInGame = Object.values(tttModule.games || {}).some(r =>
          r.id.startsWith('tictactoe') &&
          [r.game.playerX, r.game.playerO].includes(sender) &&
          r.state === 'PLAYING'
        );
        if (isInGame) {
          const extra   = await buildExtra(sock, msg, from, sender, isGroup, groupMetadata, isMe, isSuperMe, botIsAdmin, isSudo);
          const handled = await tttModule.handleTicTacToeMove(sock, msg, extra);
          if (handled) return;
        }
      }
    } catch (_) {}

    // ── COMMANDES CLASSIQUES ────────────────────────────────
    if (!isCommand) return;

    const rawArgs    = body.slice(config.prefix.length).trim().split(/\s+/);
    const commandName = rawArgs.shift().toLowerCase();
    const args        = rawArgs;
    const command     = commands.get(commandName) ||
      [...commands.values()].find(c => c.aliases?.includes(commandName));

    if (!command) return;

    // ──────────────────────────────────────────────────────
    // [FIX 1] SELFMODE — LOGIQUE CORRIGÉE
    //
    // Ancienne logique (BUGGUÉE) :
    //   if (!isMe) → bloque tout le monde sauf owner
    //   → Les supremeOwners non reconnus comme owner passent pas
    //
    // Nouvelle logique :
    //   isMe = true  → TOUJOURS autorisé (owner + supremeOwner + fromMe)
    //   isSudo = true → autorisé SAUF catégorie souveraineté/ownerOnly
    //   sinon → selfMode bloque si activé
    //
    // Résultat :
    //   - Owner + SupremeOwner → répondus partout (groupe ET privé)
    //   - Sudo → bypass selfMode mais pas ownerOnly
    //   - Users → bloqués en selfMode
    // ──────────────────────────────────────────────────────
    if (!isMe) {
      if (isSudo) {
        // Sudo bloqué sur commandes réservées au souverain
        if (command.ownerOnly || command.category === SUDO_BLOCKED_CATEGORY) return;
      } else if (config.selfMode) {
        // Mode privé : UNIQUEMENT owners et supremeOwners passent
        // Tout autre utilisateur est silencieux
        return;
      }
    }

    // ── GUARDS COMMANDES ────────────────────────────────────
    if (command.ownerOnly && !isMe)
      return sock.sendMessage(from, {
        text: `👑 *sᴇᴜʟ ʟᴇ ᴍᴀɪ̂ᴛʀᴇ ᴘᴇᴜᴛ ᴏʀᴅᴏɴɴᴇʀ ᴄᴇʟᴀ.*`
      }, { quoted: msg });

    if (command.modOnly && !isMod(sender) && !isMe)
      return sock.sendMessage(from, {
        text: `ʀᴇ́sᴇʀᴠᴇ́ ᴀᴜx ᴍᴀɪ̂ᴛʀᴇs sᴇᴄᴏɴᴅᴀɪʀᴇs.`
      }, { quoted: msg });

    // [FIX 10] groupOnly : vérification propre + message explicite
    if (command.groupOnly && !isGroup)
      return sock.sendMessage(from, {
        text: `ᴄᴇᴛᴛᴇ ᴍᴀɢɪᴇ ɴᴇ ғᴏɴᴄᴛɪᴏɴɴᴇ ǫᴜᴇ ᴅᴀɴs ʟᴇs sᴀɴᴄᴛᴜᴀɪʀᴇs.`
      }, { quoted: msg });

    if (command.privateOnly && isGroup)
      return sock.sendMessage(from, {
        text: `ᴘᴀʀʟᴇ-ᴍᴏɪ ᴇɴ ᴘʀɪᴠᴇ́ ᴘᴏᴜʀ ᴄᴇʟᴀ.`
      }, { quoted: msg });

    if (command.adminOnly && !isMe && !(await isAdmin(sock, sender, from, groupMetadata)))
      return sock.sendMessage(from, {
        text: `ᴛᴜ ɴ'ᴇs ᴘᴀs ɢᴀʀᴅɪᴇɴ.`
      }, { quoted: msg });

    if (command.botAdminNeeded && !botIsAdmin)
      return sock.sendMessage(from, {
        text: `ɢʜᴏsᴛɢ-𝐗 ᴅᴏɪᴛ ᴇ̂ᴛʀᴇ ɢᴀʀᴅɪᴇɴ ᴘᴏᴜʀ ᴇxᴇ́ᴄᴜᴛᴇʀ ᴄᴇᴄɪ.`
      }, { quoted: msg });

    if (config.autoTyping) await sock.sendPresenceUpdate('composing', from);

    const extra = await buildExtra(
      sock, msg, from, sender,
      isGroup, groupMetadata,
      isMe, isSuperMe, botIsAdmin, isSudo
    );
    await command.execute(sock, msg, args, extra);

  } catch (error) {
    if (error.message?.includes('rate-overlimit')) return;
    try {
      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ *ᴜɴᴇ ғʀᴀᴄᴛᴜʀᴇ ᴅᴀɴs ʟᴀ ᴍᴀᴛʀɪᴄᴇ :*\n\n${error.message}`
      }, { quoted: msg });
    } catch (_) {}
  }
};

// ==========================================
// GROUP UPDATES (welcome / goodbye)
// ==========================================
const handleGroupUpdate = async (sock, update) => {
  try {
    const { id, participants, action } = update;
    if (!id?.endsWith('@g.us')) return;
    const groupSettings = database.getGroupSettings(id);
    if (!groupSettings.welcome && !groupSettings.goodbye) return;
    if (groupSettings.isMuted) return;
    const groupMetadata = await getGroupMetadata(sock, id);
    if (!groupMetadata) return;
    const timeString = new Date().toLocaleTimeString('fr-FR', {
      timeZone: 'Africa/Ouagadougou', hour: '2-digit', minute: '2-digit'
    });
    for (const participant of participants) {
      const participantJid = (
        participant?.id || participant?.jid ||
        participant?.participant ||
        (typeof participant === 'string' ? participant : null)
      );
      if (!participantJid) continue;
      const participantNumber = participantJid.split('@')[0];
      let profilePicUrl = 'https://files.catbox.moe/k37u59.png';
      try { profilePicUrl = await sock.profilePictureUrl(participantJid, 'image'); } catch (_) {}

      if (action === 'add' && groupSettings.welcome) {
        const groupName  = groupMetadata.subject || 'ʟᴇ sᴀɴᴄᴛᴜᴀɪʀᴇ';
        const welcomeMsg =
          `╭━≪• *🎬 ${toSmallCaps('entite detectee')}* •≫╾╮\n┃\n` +
          `┃ 🔮 *${toSmallCaps('ame')} :* @${participantNumber}\n` +
          `┃ 📊 *${toSmallCaps('effectif du neant')} :* #${groupMetadata.participants.length}\n` +
          `┃ ⏰ *${toSmallCaps('heure sombre')} :* ${timeString}\n` +
          `┃ 🚪 *${toSmallCaps('sanctuaire')} :* ${groupName}\n┃\n` +
          `╰━━━━━━━━━━━━━━━━╯\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`;
        try {
          const img = await axios.get(profilePicUrl, { responseType: 'arraybuffer' });
          await sock.sendMessage(id, {
            image: Buffer.from(img.data), caption: welcomeMsg, mentions: [participantJid]
          });
        } catch (_) {
          await sock.sendMessage(id, { text: welcomeMsg, mentions: [participantJid] });
        }

      } else if (action === 'remove' && groupSettings.goodbye) {
        const goodbyeMsg =
          `╭━≪• *🎬 ${toSmallCaps('ame egaree')}* •≫╾╮\n┃\n` +
          `┃ 🚪 *${toSmallCaps('depart')} :* @${participantNumber}\n` +
          `┃ 🚮 *${toSmallCaps('murmure')} :* ${toSmallCaps('tu ne nous manqueras jamais')}\n` +
          `┃ 📊 *${toSmallCaps('ames restantes')} :* ${groupMetadata.participants.length}\n` +
          `┃ ⏰ *${toSmallCaps('cycle')} :* ${timeString}\n┃\n` +
          `╰━━━━━━━━━━━━━━━━╯\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`;
        try {
          const img = await axios.get(profilePicUrl, { responseType: 'arraybuffer' });
          await sock.sendMessage(id, {
            image: Buffer.from(img.data), caption: goodbyeMsg, mentions: [participantJid]
          });
        } catch (_) {
          await sock.sendMessage(id, { text: goodbyeMsg, mentions: [participantJid] });
        }
      }
    }
  } catch (error) {
    if (error.message?.includes('403')) return;
    console.error('Erreur GroupUpdate:', error);
  }
};

// ==========================================
// ANTI-LINK
// [FIX 8] : pattern URL étendu (WhatsApp channels, Telegram, etc.)
// ==========================================
const handleAntilink = async (sock, msg, groupMetadata) => {
  try {
    const from   = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const groupSettings = database.getGroupSettings(from);
    if (!groupSettings.antilink) return;

    const body = (
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.imageMessage?.caption ||
      msg.message?.videoMessage?.caption || ''
    );

    // [FIX 8] Pattern URL renforcé — inclut t.me, wa.me, whatsapp.com/channel
    const linkPattern = /(https?:\/\/|www\.)([a-zA-Z0-9][a-zA-Z0-9-]*\.)+[a-zA-Z]{2,}(\/[^\s]*)?/i;
    if (!linkPattern.test(body)) return;

    // Exemptions hiérarchie
    if (isAnyOwner(sender) || isSudoUser(sender)) return;
    if (await isAdmin(sock, sender, from, groupMetadata)) return;

    const botAdmin = await isBotAdmin(sock, from);
    await sock.sendMessage(from, { delete: msg.key });
    if ((groupSettings.antilinkAction || 'delete').toLowerCase() === 'kick' && botAdmin)
      await sock.groupParticipantsUpdate(from, [sender], 'remove');
  } catch (_) {}
};

// ==========================================
// ANTI-GROUP MENTION
// ==========================================
const handleAntigroupmention = async (sock, msg, groupMetadata) => {
  try {
    const from   = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const groupSettings = database.getGroupSettings(from);
    if (!groupSettings.antigroupmention) return;
    const isForwardedStatus =
      !!msg.message?.groupStatusMentionMessage ||
      msg.message?.protocolMessage?.type === 25 ||
      !!msg.message?.extendedTextMessage?.contextInfo?.forwardedNewsletterMessageInfo ||
      !!msg.message?.contextInfo?.isForwarded;
    if (!isForwardedStatus) return;
    if (isAnyOwner(sender) || isSudoUser(sender)) return;
    if (await isAdmin(sock, sender, from, groupMetadata)) return;
    const botAdmin = await isBotAdmin(sock, from);
    await sock.sendMessage(from, { delete: msg.key });
    if ((groupSettings.antigroupmentionAction || 'delete').toLowerCase() === 'kick' && botAdmin)
      await sock.groupParticipantsUpdate(from, [sender], 'remove');
  } catch (_) {}
};

// ==========================================
// ANTI-CALL
// ==========================================
const initializeAntiCall = (sock) => {
  sock.ev.on('call', async (calls) => {
    try {
      if (!config.defaultGroupSettings?.anticall) return;
      for (const call of calls) {
        if (call.status === 'offer') {
          await sock.rejectCall(call.id, call.from);
          await sock.updateBlockStatus(call.from, 'block');
          await sock.sendMessage(call.from, {
            text: `ɢʜᴏsᴛɢ-𝐗 ɴᴇ ʀᴇ́ᴘᴏɴᴅ ǫᴜ'ᴀᴜx ᴍᴇssᴀɢᴇs ᴇ́ᴄʀɪᴛs.`
          });
        }
      }
    } catch (_) {}
  });
};

// ==========================================
// EXPORTS
// ==========================================
module.exports = {
  handleMessage,
  handleGroupUpdate,
  handleAntilink,
  handleAntigroupmention,
  initializeAntiCall,
  isSupremeOwner,
  isOwner,
  isAnyOwner,
  isSudoUser,
  isAdmin,
  isBotAdmin,
  isMod,
  getGroupMetadata,
  findParticipant,
  SUPREME_OWNER_LIDS,
  SUDO_BLOCKED_CATEGORY,
};
