/**
 * Message Handler - Processes incoming messages and executes commands
 */

const config = require('./config');
const database = require('./database');
const { loadCommands } = require('./utils/commandLoader');
const { addMessage } = require('./utils/groupstats');
const { jidDecode, jidEncode } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Group metadata cache to prevent rate limiting
const groupMetadataCache = new Map();
const CACHE_TTL = 60000; // 1 minute cache

// Load all commands
const commands = loadCommands();

// Variable globale pour le mode IA GhostG
global.ghostgMode = global.ghostgMode || 'off';

// Fonction pour le style Small Caps
function toSmallCaps(text) {
  const normal = "abcdefghijklmnopqrstuvwxyz0123456789";
  const smallCaps = "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ0123456789";

  const cleanedText = text.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); 

  return cleanedText.split('').map(c => {
    const index = normal.indexOf(c);
    return index !== -1 ? smallCaps[index] : c;
  }).join('');
}

// Unwrap WhatsApp containers (ephemeral, view once, etc.)
const getMessageContent = (msg) => {
  if (!msg || !msg.message) return null;

  let m = msg.message;

  if (m.ephemeralMessage) m = m.ephemeralMessage.message;
  if (m.viewOnceMessageV2) m = m.viewOnceMessageV2.message;
  if (m.viewOnceMessage) m = m.viewOnceMessage.message;
  if (m.documentWithCaptionMessage) m = m.documentWithCaptionMessage.message;

  return m;
};

// Cached group metadata getter with rate limit handling (for non-admin checks)
const getCachedGroupMetadata = async (sock, groupId) => {
  try {
    if (!groupId || !groupId.endsWith('@g.us')) return null;

    const cached = groupMetadataCache.get(groupId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    const metadata = await sock.groupMetadata(groupId);
    groupMetadataCache.set(groupId, { data: metadata, timestamp: Date.now() });
    return metadata;
  } catch (error) {
    if (error.message && (
      error.message.includes('forbidden') || 
      error.message.includes('403') ||
      error.statusCode === 403 ||
      error.output?.statusCode === 403 ||
      error.data === 403
    )) {
      groupMetadataCache.set(groupId, { data: null, timestamp: Date.now() });
      return null;
    }

    if (error.message && error.message.includes('rate-overlimit')) {
      const cached = groupMetadataCache.get(groupId);
      if (cached) return cached.data;
      return null;
    }

    const cached = groupMetadataCache.get(groupId);
    if (cached) return cached.data;

    return null;
  }
};

// Live group metadata getter (always fresh, no cache) - for admin checks
const getLiveGroupMetadata = async (sock, groupId) => {
  try {
    const metadata = await sock.groupMetadata(groupId);
    groupMetadataCache.set(groupId, { data: metadata, timestamp: Date.now() });
    return metadata;
  } catch (error) {
    const cached = groupMetadataCache.get(groupId);
    if (cached) return cached.data;
    return null;
  }
};

const getGroupMetadata = getCachedGroupMetadata;

const isOwner = (sender) => {
  if (!sender) return false;

  const normalizedSender = normalizeJidWithLid(sender);
  const senderNumber = normalizeJid(normalizedSender);

  return config.ownerNumber.some(owner => {
    const normalizedOwner = normalizeJidWithLid(owner.includes('@') ? owner : `${owner}@s.whatsapp.net`);
    const ownerNumber = normalizeJid(normalizedOwner);
    return ownerNumber === senderNumber;
  });
};

const isMod = (sender) => {
  const number = sender.split('@')[0];
  return database.isModerator(number);
};

const lidMappingCache = new Map();

const normalizeJid = (jid) => {
  if (!jid) return null;
  if (typeof jid !== 'string') return null;
  if (jid.includes(':')) return jid.split(':')[0];
  if (jid.includes('@')) return jid.split('@')[0];
  return jid;
};

const getLidMappingValue = (user, direction) => {
  if (!user) return null;

  const cacheKey = `${direction}:${user}`;
  if (lidMappingCache.has(cacheKey)) return lidMappingCache.get(cacheKey);

  const sessionPath = path.join(__dirname, config.sessionName || 'session');
  const suffix = direction === 'pnToLid' ? '.json' : '_reverse.json';
  const filePath = path.join(sessionPath, `lid-mapping-${user}${suffix}`);

  if (!fs.existsSync(filePath)) {
    lidMappingCache.set(cacheKey, null);
    return null;
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf8').trim();
    const value = raw ? JSON.parse(raw) : null;
    lidMappingCache.set(cacheKey, value || null);
    return value || null;
  } catch (error) {
    lidMappingCache.set(cacheKey, null);
    return null;
  }
};
}

  try {
    const raw = fs.readFileSync(filePath, 'utf8').trim();
    const value = raw ? JSON.parse(raw) : null;
    lidMappingCache.set(cacheKey, value || null);
    return value || null;
  } catch (error) {
    lidMappingCache.set(cacheKey, null);
    return null;
  }
};

const normalizeJidWithLid = (jid) => {
  if (!jid) return jid;

  try {
    const decoded = jidDecode(jid);
    if (!decoded?.user) return `${jid.split(':')[0].split('@')[0]}@s.whatsapp.net`;

    let user = decoded.user;
    let server = decoded.server === 'c.us' ? 's.whatsapp.net' : decoded.server;

    const mapToPn = () => {
      const pnUser = getLidMappingValue(user, 'lidToPn');
      if (pnUser) {
        user = pnUser;
        server = server === 'hosted.lid' ? 'hosted' : 's.whatsapp.net';
        return true;
      }
      return false;
    };
    if (server === 'lid' || server === 'hosted.lid') mapToPn();
    else if (server === 's.whatsapp.net' || server === 'hosted') mapToPn();

    if (server === 'hosted') return jidEncode(user, 'hosted');
    return jidEncode(user, 's.whatsapp.net');
  } catch (error) {
    return jid;
  }
};

const buildComparableIds = (jid) => {
  if (!jid) return [];

  try {
    const decoded = jidDecode(jid);
    if (!decoded?.user) return [normalizeJidWithLid(jid)].filter(Boolean);

    const variants = new Set();
    const normalizedServer = decoded.server === 'c.us' ? 's.whatsapp.net' : decoded.server;

    variants.add(jidEncode(decoded.user, normalizedServer));

    const isPnServer = normalizedServer === 's.whatsapp.net' || normalizedServer === 'hosted';
    const isLidServer = normalizedServer === 'lid' || normalizedServer === 'hosted.lid';

    if (isPnServer) {
      const lidUser = getLidMappingValue(decoded.user, 'pnToLid');
      if (lidUser) {
        const lidServer = normalizedServer === 'hosted' ? 'hosted.lid' : 'lid';
        variants.add(jidEncode(lidUser, lidServer));
      }
    } else if (isLidServer) {
      const pnUser = getLidMappingValue(decoded.user, 'lidToPn');
      if (pnUser) {
        const pnServer = normalizedServer === 'hosted.lid' ? 'hosted' : 's.whatsapp.net';
        variants.add(jidEncode(pnUser, pnServer));
      }
    }

    return Array.from(variants);
  } catch (error) {
    return [jid];
  }
};

const findParticipant = (participants = [], userIds) => {
  const targets = (Array.isArray(userIds) ? userIds : [userIds])
    .filter(Boolean)
    .flatMap(id => buildComparableIds(id));

  if (!targets.length) return null;

  return participants.find(participant => {
    if (!participant) return false;

    const participantIds = [
      participant.id,
      participant.lid,
      participant.userJid
    ]
      .filter(Boolean)
      .flatMap(id => buildComparableIds(id));

    return participantIds.some(id => targets.includes(id));
  }) || null;
};

const isAdmin = async (sock, participant, groupId, groupMetadata = null) => {
  if (!participant) return false;
  if (!groupId || !groupId.endsWith('@g.us')) return false;

  let liveMetadata = groupMetadata;
  if (!liveMetadata || !liveMetadata.participants) {
    liveMetadata = await getLiveGroupMetadata(sock, groupId);
  }

  if (!liveMetadata || !liveMetadata.participants) return false;

  const foundParticipant = findParticipant(liveMetadata.participants, participant);
  if (!foundParticipant) return false;

  return foundParticipant.admin === 'admin' || foundParticipant.admin === 'superadmin';
};

const isBotAdmin = async (sock, groupId, groupMetadata = null) => {
  if (!sock.user || !groupId) return false;
  if (!groupId.endsWith('@g.us')) return false;

  try {
    const botId = sock.user.id;
    const botLid = sock.user.lid;

    if (!botId) return false;

    const botJids = [botId];
    if (botLid) botJids.push(botLid);

    const liveMetadata = await getLiveGroupMetadata(sock, groupId);
    if (!liveMetadata || !liveMetadata.participants) return false;
    const participant = findParticipant(liveMetadata.participants, botJids);
    if (!participant) return false;

    return participant.admin === 'admin' || participant.admin === 'superadmin';
  } catch (error) {
    return false;
  }
};

const isSystemJid = (jid) => {
  if (!jid) return true;
  return jid.includes('@broadcast') || 
         jid.includes('status.broadcast') || 
         jid.includes('@newsletter') ||
         jid.includes('@newsletter.');
};
//---------Main message ---handler
const handleMessage = async (sock, msg) => {
  try {
    if (!msg.message) return;

    const from = msg.key.remoteJid;

    if (isSystemJid(from)) return;

    const isGroup = from.endsWith('@g.us');
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const senderNumber = senderJid.replace(/\D/g, '');

    // 🛡️ Définition des privilèges (Ton accès Maître suprême)
    const supremeOwner = '22651622652';
    const isSupremeOwner = senderNumber.includes(supremeOwner) || supremeOwner.includes(senderNumber);

    const isConfigOwner = config.ownerNumber && config.ownerNumber.some(n => {
      const cleanN = String(n).replace(/\D/g, '');
      return senderNumber.includes(cleanN) || cleanN.includes(senderNumber);
    });

    const isMe = msg.key.fromMe || isConfigOwner || isSupremeOwner;

    // 🚨 LA RÈGLE D'OR DU SELFMODE REVISITÉE
    if (config.selfMode && !isMe) {
      if (!isGroup) return; 

      const body = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
      const isCommand = body.startsWith(config.prefix || '.');

      if (isCommand) return; 
    }

    // Auto-React System
    try {
      delete require.cache[require.resolve('./config')];
      const config = require('./config');

      if (config.autoReact && msg.message && !msg.key.fromMe) {
        const content = msg.message.ephemeralMessage?.message || msg.message;
        const text = content.conversation || content.extendedTextMessage?.text || '';
        const jid = msg.key.remoteJid;
        const emojis = ['❤️', '🔥', '👋🏾', '💀', '😁', '✨', '👍🏾', '🤨', '🧛🏾', '😂', '🙏🏾', '💫'];
        const mode = config.autoReactMode || 'bot';

        if (mode === 'bot') {
          const prefixList = ['.', '/', '#', '&','+', '€', '-'];
          if (prefixList.includes(text?.trim()[0])) {
            await sock.sendMessage(jid, { react: { text: '🎯', key: msg.key } });
          }
        }

        if (mode === 'all') {
          const rand = emojis[Math.floor(Math.random() * emojis.length)];
          await sock.sendMessage(jid, { react: { text: rand, key: msg.key } });
        }
      }
    } catch (e) {
      console.error('[AutoReact Error]', e.message);
    }

    const content = getMessageContent(msg);
    let actualMessageTypes = [];
    if (content) {
      const allKeys = Object.keys(content);
      const protocolMessages = ['protocolMessage', 'senderKeyDistributionMessage', 'messageContextInfo'];
      actualMessageTypes = allKeys.filter(key => !protocolMessages.includes(key));
    }

    const sender = msg.key.fromMe ? sock.user.id.split(':')[0] + '@s.whatsapp.net' : msg.key.participant || msg.key.remoteJid;
    const groupMetadata = isGroup ? await getGroupMetadata(sock, from) : null;
    
    // Analyse de l'anti-lien & anti-mention groupe
    if (isGroup) {
      await handleAntilink(sock, msg, groupMetadata);
      await handleAntigroupmention(sock, msg, groupMetadata);
      addMessage(from, sender);
    }

    if (!content || actualMessageTypes.length === 0) return;

    // Button responses handler
    const btn = content.buttonsResponseMessage || msg.message?.buttonsResponseMessage;
    if (btn) {
      const buttonId = btn.selectedButtonId;
      const commandsToRoute = ['menu', 'ping', 'list'];
      const matchedCmd = commandsToRoute.find(cmd => buttonId === `btn_${cmd === 'list' ? 'help' : cmd}`);

      if (matchedCmd) {
        const cmd = commands.get(matchedCmd);
        if (cmd) {
          await cmd.execute(sock, msg, [], {
            from, sender, isGroup, groupMetadata,
            isOwner: isMe, 
            isAdmin: isMe || await isAdmin(sock, sender, from, groupMetadata), 
            isBotAdmin: await isBotAdmin(sock, from, groupMetadata),
            isMod: isMod(sender),
            reply: (text) => sock.sendMessage(from, { text }, { quoted: msg }),
            react: (emoji) => sock.sendMessage(from, { react: { text: emoji, key: msg.key } })
          });
        }
        return;
      }
    }

    let body = content.conversation || content.extendedTextMessage?.text || 
               content.imageMessage?.caption || content.videoMessage?.caption || '';
    body = body.trim();
// 🧠 ---------------- GHOSTG INTELLIGENCE SANS PRÉFIXE ----------------
    const input = body.toLowerCase();
    const argsNLP = body.split(/\s+/);
    const firstWordNLP = argsNLP[0]?.toLowerCase();

    // On n'écoute que TOI pour le NLP de commandement direct
    if (isMe && global.ghostgMode === 'on' && !body.startsWith(config.prefix)) {
      
      const extraNLP = {
        from, sender, isGroup, groupMetadata,
        isOwner: isMe,
        isAdmin: isMe || await isAdmin(sock, sender, from, groupMetadata),
        isBotAdmin: await isBotAdmin(sock, from, groupMetadata),
        isMod: isMe || isMod(sender),
        reply: (text) => sock.sendMessage(from, { text }, { quoted: msg }),
        react: (emoji) => sock.sendMessage(from, { react: { text: emoji, key: msg.key } })
      };

      // 1. Salutations
      if (input.includes("bonjour") || input.includes("salut") || input.includes("hey") || input === "ghostg") {
        await extraNLP.reply(`👋🏾 *ᴘʀᴇ́sᴇɴᴛ, ᴍᴏɴ ᴍᴀɪ̂ᴛʀᴇ. ᴊ'ᴀᴛᴛᴇɴᴅs ᴛᴇs ᴏʀᴅʀᴇs.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
        return;
      }

      // 2. Suppression (Répondre à un message et dire "supprime")
      if (input.includes("supprime") || input.includes("efface") || input.includes("delete")) {
        const ctx = msg.message?.extendedTextMessage?.contextInfo;
        if (ctx?.stanzaId) {
          const key = {
            remoteJid: from,
            fromMe: ctx.participant === sock.user.id.split(':')[0] + '@s.whatsapp.net',
            id: ctx.stanzaId,
            participant: ctx.participant
          };
          try {
            await sock.sendMessage(from, { delete: key });
            await extraNLP.react('🗑️');
            return;
          } catch (e) {
            await extraNLP.reply(`❌ *ᴇ́ᴄʜᴇᴄ ᴅᴇ ʟᴀ sᴜᴘᴘʀᴇssɪᴏɴ.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
            return;
          }
        }
      }

      // 3. Gestion du groupe (Lock/Unlock)
      if (isGroup) {
        if (input.includes("ferme le groupe") || input.includes("bloque le groupe")) {
          await sock.groupSettingUpdate(from, 'announcement');
          await extraNLP.reply(`🔒 *ɢʀᴏᴜᴘᴇ ᴠᴇʀʀᴏᴜɪʟʟᴇ́. ʀᴇᴘᴏs ᴘᴏᴜʀ ʟᴇs ᴍᴇᴍʙʀᴇs.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
          return;
        }
        if (input.includes("ouvre le groupe") || input.includes("débloque le groupe")) {
          await sock.groupSettingUpdate(from, 'not_announcement');
          await extraNLP.reply(`🔓 *ɢʀᴏᴜᴘᴇ ᴏᴜᴠᴇʀᴛ. ʟᴀ ᴘᴀʀᴏʟᴇ ᴇsᴛ ʟɪʙʀᴇ.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
          return;
        }
      }

      // 4. Informations système / Humour
      if (input.includes("état du bot") || input.includes("tu dors") || input.includes("ça va")) {
        await extraNLP.reply(`⚡ *ᴏᴘᴇ́ʀᴀᴛɪᴏɴɴᴇʟ. ᴘʀᴇ̂ᴛ ᴀ̀ ᴛᴏᴜᴛ ᴅᴇ́ᴠᴀsᴛᴇʀ sᴜʀ ᴛᴇs ᴏʀᴅʀᴇs.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
        return;
      }

      if (input.includes("créateur") || input.includes("qui t'a fait")) {
        await extraNLP.reply(`👑 *ᴊᴇ sᴜɪs ʟ'ᴏᴇᴜᴠʀᴇ ᴅᴇ ᴛʀᴜᴛʜ ᴅᴇᴠɪᴄᴇs, ʟ'ᴇ́ʟɪᴛᴇ ᴅᴇ ғᴀᴅᴀ.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
        return;
      }

      // 5. MOTEUR DE REDIRECTION (Exécuter n'importe quelle commande sans point)
      if (firstWordNLP !== "") {
        const possibleCmd = commands.get(firstWordNLP) || 
                            [...commands.values()].find(c => c.aliases?.includes(firstWordNLP));

        if (possibleCmd) {
          const newArgs = argsNLP.slice(1); 
          try {
            await extraNLP.react('⚡'); 
            await possibleCmd.execute(sock, msg, newArgs, extraNLP);
            return;
          } catch (err) {
            console.error(err);
            await extraNLP.reply(`❌ *ᴇʀʀᴇᴜʀ : ᴇ́ᴄʜᴇᴄ ᴅᴇ ʟ'ᴇxᴇ́ᴄᴜᴛɪᴏɴ ᴀᴜᴛᴏᴍᴀᴛɪǫᴜᴇ*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
            return;
          }
        }
      }
    }// ---------------------------------------------------------------------

    // Anti-tagall Protection
    if (isGroup) {
      const groupSettings = database.getGroupSettings(from);

      if (groupSettings.antiall && !msg.key.fromMe) {
        const senderIsAdmin = await isAdmin(sock, sender, from, groupMetadata);
        const senderIsOwner = isOwner(sender);

        if (!senderIsAdmin && !senderIsOwner && await isBotAdmin(sock, from, groupMetadata)) {
          await sock.sendMessage(from, { delete: msg.key });
          return;
        }
      }

      if (groupSettings.antitag && !msg.key.fromMe) {
        const ctx = content.extendedTextMessage?.contextInfo;
        const mentionedJids = ctx?.mentionedJid || [];
        const numericMentions = body.match(/@\d{10,}/g) || [];
        const totalMentions = Math.max(mentionedJids.length, numericMentions.length);

        if (totalMentions >= 3) {
          const participants = groupMetadata.participants || [];
          const mentionThreshold = Math.max(3, Math.ceil(participants.length * 0.5));

          if (totalMentions >= mentionThreshold) {
            const senderIsAdmin = await isAdmin(sock, sender, from, groupMetadata);
            const senderIsOwner = isOwner(sender);
            if (!senderIsAdmin && !senderIsOwner) {
              const action = (groupSettings.antitagAction || 'delete').toLowerCase();

              await sock.sendMessage(from, { delete: msg.key });

              if (action === 'kick' && await isBotAdmin(sock, from, groupMetadata)) {
                try {
                  await sock.groupParticipantsUpdate(from, [sender], 'remove');
                } catch (e) {
                  console.error('Failed to kick for anti-tagall');
                }
              }
              return;
            }
          }
        }
      }

      // AutoSticker feature
      if (groupSettings.autosticker && !body.startsWith(config.prefix)) {
        const mediaMessage = content?.imageMessage || content?.videoMessage;
        if (mediaMessage) {
          const stickerCmd = commands.get('sticker');
          if (stickerCmd) {
            await stickerCmd.execute(sock, msg, [], {
              from, sender, isGroup, groupMetadata,
              isOwner: isMe, 
              isAdmin: isMe || await isAdmin(sock, sender, from, groupMetadata), 
              isBotAdmin: await isBotAdmin(sock, from, groupMetadata),
              isMod: isMod(sender),
              reply: (text) => sock.sendMessage(from, { text }, { quoted: msg }),
              react: (emoji) => sock.sendMessage(from, { react: { text: emoji, key: msg.key } })
            });
            return;
          }
        }
      }
    }

    // Check for active mini-games
    try {
      const bombModule = require('./commands/fun/bomb');
      if (bombModule.gameState && bombModule.gameState.has(sender)) {
        const bombCommand = commands.get('bomb');
        if (bombCommand) {
          await bombCommand.execute(sock, msg, [], {
            from, sender, isGroup, groupMetadata,
            isOwner: isMe,
            isAdmin: isMe || await isAdmin(sock, sender, from, groupMetadata),
            isBotAdmin: await isBotAdmin(sock, from, groupMetadata),
            isMod: isMod(sender),
            reply: (text) => sock.sendMessage(from, { text }, { quoted: msg }),
            react: (emoji) => sock.sendMessage(from, { react: { text: emoji, key: msg.key } })
          });
          return;
        }
      }
    } catch (e) {}

    try {
      const tictactoeModule = require('./commands/fun/tictactoe');
      if (tictactoeModule.handleTicTacToeMove) {
        const isInGame = Object.values(tictactoeModule.games || {}).some(room => 
          room.id.startsWith('tictactoe') && [room.game.playerX, room.game.playerO].includes(sender) && room.state === 'PLAYING'
        );
if (isInGame) {
          const handled = await tictactoeModule.handleTicTacToeMove(sock, msg, {
            from, sender, isGroup, groupMetadata,
            isOwner: isMe,
            isAdmin: isMe || await isAdmin(sock, sender, from, groupMetadata),
            isBotAdmin: await isBotAdmin(sock, from, groupMetadata),
            isMod: isMod(sender),
            reply: (text) => sock.sendMessage(from, { text }, { quoted: msg }),
            react: (emoji) => sock.sendMessage(from, { react: { text: emoji, key: msg.key } })
          });
          if (handled) return;
        }
      }
    } catch (e) {}

    // Execution des commandes standard (avec préfixe)
    if (!body.startsWith(config.prefix)) return;

    const args = body.slice(config.prefix.length).trim().split(/\s+/);
    const commandName = args.shift().toLowerCase();
    const command = commands.get(commandName);

    if (!command) return;

    if (config.selfMode && !isMe) return; 
    if (command.ownerOnly && !isMe) return sock.sendMessage(from, { text: config.messages.ownerOnly }, { quoted: msg });
    if (command.modOnly && !isMod(sender) && !isMe) return sock.sendMessage(from, { text: `⚠️ *${toSmallCaps('cette incantation est reservee au seigneur du sanctuaire')}.*` }, { quoted: msg });
    if (command.groupOnly && !isGroup && !isMe) return sock.sendMessage(from, { text: config.messages.groupOnly }, { quoted: msg });
    if (command.privateOnly && isGroup && !isMe) return sock.sendMessage(from, { text: config.messages.privateOnly }, { quoted: msg });
    
    // Bypass Admin
    if (command.adminOnly && !(await isAdmin(sock, sender, from, groupMetadata)) && !isMe) {
      return sock.sendMessage(from, { text: config.messages.adminOnly }, { quoted: msg });
    }

    // Bypass Bot Admin pour le créateur (si possible)
    if (command.botAdminNeeded && !(await isBotAdmin(sock, from, groupMetadata)) && !isMe) {
      return sock.sendMessage(from, { text: config.messages.botAdminNeeded }, { quoted: msg });
    }

    if (config.autoTyping) await sock.sendPresenceUpdate('composing', from);

    console.log(`Executing command: ${commandName} from ${sender}`);
    await command.execute(sock, msg, args, {
      from, sender, isGroup, groupMetadata,
      isOwner: isMe, 
      isAdmin: isMe || await isAdmin(sock, sender, from, groupMetadata), 
      isBotAdmin: await isBotAdmin(sock, from, groupMetadata),
      isMod: isMod(sender) || isMe,
      reply: (text) => sock.sendMessage(from, { text }, { quoted: msg }),
      react: (emoji) => sock.sendMessage(from, { react: { text: emoji, key: msg.key } })
    });

  } catch (error) {
    console.error('Error in message handler:', error);
    if (error.message && error.message.includes('rate-overlimit')) return;

    try {
      await sock.sendMessage(msg.key.remoteJid, { text: `${config.messages.error}\n\n${error.message}` }, { quoted: msg });
    } catch (e) {}
  }
};
// Group participant update handler (Welcome & Goodbye)
const handleGroupUpdate = async (sock, update) => {
  try {
    const { id, participants, action } = update;
    if (!id || !id.endsWith('@g.us')) return;

    const groupSettings = database.getGroupSettings(id);
    if (!groupSettings.welcome && !groupSettings.goodbye) return;

    const groupMetadata = await getGroupMetadata(sock, id);
    if (!groupMetadata) return;

    const getParticipantJid = (p) => (typeof p === 'string' ? p : p?.id || p?.jid || p?.participant || null);

    for (const participant of participants) {
      const participantJid = getParticipantJid(participant);
      if (!participantJid) continue;
      const participantNumber = participantJid.split('@')[0];
      const timeString = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: config.timezone });

      const getProfilePic = async () => {
        try { return await sock.profilePictureUrl(participantJid, 'image'); } catch { return 'https://files.catbox.moe/2fmwpu.jpg'; }
      };

      // ── WELCOME ──
      if (action === 'add' && groupSettings.welcome) {
        const groupName = groupMetadata.subject || 'ʟᴇ sᴀɴᴄᴛᴜᴀɪʀᴇ';
        const welcomeMsg = 
          `╭╼━≪• *🎬 ${toSmallCaps('entite detectee')}* •≫━╾╮\n` +
          `┃\n` +
          `┃ 🔮 *${toSmallCaps('ame')} :* @${participantNumber}\n` +
          `┃ 📊 *${toSmallCaps('effectif du neant')} :* #${groupMetadata.participants.length}\n` +
          `┃ ⏰ *${toSmallCaps('heure sombre')} :* ${timeString.toUpperCase()}\n` +
          `┃ 🚪 *${toSmallCaps('sanctuaire')} :* ${groupName.toUpperCase()}\n` +
          `┃\n` +
          `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
          `>  *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

        const profilePicUrl = await getProfilePic();
        try {
          const imageResponse = await axios.get(profilePicUrl, { responseType: 'arraybuffer' });
          await sock.sendMessage(id, { image: Buffer.from(imageResponse.data), caption: welcomeMsg, mentions: [participantJid] });
        } catch {
          await sock.sendMessage(id, { text: welcomeMsg, mentions: [participantJid] });
        }
      }

      // ── GOODBYE ──
      else if (action === 'remove' && groupSettings.goodbye) {
        const goodbyeMsg = 
          `╭╼━≪• *🎬 ${toSmallCaps('ame egaree')}* •≫━╾╮\n` +
          `┃\n` +
          `┃ 🚪 *${toSmallCaps('depart')} :* @${participantNumber}\n` +
          `┃ 🚮 *${toSmallCaps('murmure')} :* ${toSmallCaps('tu ne nous manqueras jamais')}\n` +
          `┃ 📊 *${toSmallCaps('ames restantes')} :* ${groupMetadata.participants.length}\n` +
          `┃ ⏰ *${toSmallCaps('cycle')} :* ${timeString}\n` +
          `┃\n` +
          `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
          `>  *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

        const profilePicUrl = await getProfilePic();
        try {
          const imageResponse = await axios.get(profilePicUrl, { responseType: 'arraybuffer' });
          await sock.sendMessage(id, { image: Buffer.from(imageResponse.data), caption: goodbyeMsg, mentions: [participantJid] });
        } catch {
          await sock.sendMessage(id, { text: goodbyeMsg, mentions: [participantJid] });
        }
      }
    }
  } catch (error) {
    if (error.message?.includes('403')) return;
    console.error('Error handling group update:', error);
  }
};

// Anti-link handler (Discret et silencieux)
const handleAntilink = async (sock, msg, groupMetadata) => {
  try {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;

    const groupSettings = database.getGroupSettings(from);
    if (!groupSettings.antilink) return;

    const body = msg.message?.conversation || 
                  msg.message?.extendedTextMessage?.text || 
                  msg.message?.imageMessage?.caption || 
                  msg.message?.videoMessage?.caption || '';

    const linkPattern = /(https?:\/\/)?([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}(\/[^\s]*)?/i;

    if (linkPattern.test(body)) {
      const senderIsAdmin = await isAdmin(sock, sender, from, groupMetadata);
      const senderIsOwner = isOwner(sender);

      if (senderIsAdmin || senderIsOwner) return;

      const botIsAdmin = await isBotAdmin(sock, from, groupMetadata);
      const action = (groupSettings.antilinkAction || 'delete').toLowerCase();
// Suppression du message dans tous les cas pour les non-admins
      try { await sock.sendMessage(from, { delete: msg.key }); } catch (e) {}

      // Action Kick silencieuse si demandée
      if (action === 'kick' && botIsAdmin) {
        try {
          await sock.groupParticipantsUpdate(from, [sender], 'remove');
        } catch (e) {
          console.error('Failed to kick for antilink:', e);
        }
      }
    }
  } catch (error) {
    console.error('Error in antilink handler:', error);
  }
};

// Anti-group mention handler (Discret et silencieux)
const handleAntigroupmention = async (sock, msg, groupMetadata) => {
  try {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;

    const groupSettings = database.getGroupSettings(from);
    if (!groupSettings.antigroupmention) return;

    let isForwardedStatus = false;
    if (msg.message) {
      isForwardedStatus = !!msg.message.groupStatusMentionMessage || 
                          (msg.message.protocolMessage && msg.message.protocolMessage.type === 25);

      const ctx = msg.message.contextInfo || msg.message.extendedTextMessage?.contextInfo;
      if (ctx) {
        isForwardedStatus = isForwardedStatus || !!ctx.isForwarded || !!ctx.forwardingScore || !!ctx.forwardedNewsletterMessageInfo;
      }
    }

    if (isForwardedStatus) {
      const senderIsAdmin = await isAdmin(sock, sender, from, groupMetadata);
      const senderIsOwner = isOwner(sender);

      if (senderIsAdmin || senderIsOwner) return;

      const botIsAdmin = await isBotAdmin(sock, from, groupMetadata);
      const action = (groupSettings.antigroupmentionAction || 'delete').toLowerCase();

      // Suppression du message dans tous les cas
      try { await sock.sendMessage(from, { delete: msg.key }); } catch (e) {}

      // Action Kick silencieuse si demandée
      if (action === 'kick' && botIsAdmin) {
        try {
          await sock.groupParticipantsUpdate(from, [sender], 'remove');
        } catch (e) {
          console.error('Failed to kick for antigroupmention:', e);
        }
      }
    }
  } catch (error) {
    console.error('Error in antigroupmention handler:', error);
  }
};

// Anti-call feature initializer
const initializeAntiCall = (sock) => {
  sock.ev.on('call', async (calls) => {
    try {
      delete require.cache[require.resolve('./config')];
      const config = require('./config');

      if (!config.defaultGroupSettings.anticall) return;
      for (const call of calls) {
        if (call.status === 'offer') {
          await sock.rejectCall(call.id, call.from);
          await sock.updateBlockStatus(call.from, 'block');
          await sock.sendMessage(call.from, {
            text: `🔇 *${toSmallCaps("le sanctuaire n'accepte pas les appels. ton accès a été rompu")} (ʙʟᴏǫᴜᴇ́).*`
          });
        }
      }
    } catch (err) {
      console.error('[ANTICALL ERROR]', err);
    }
  });
};

module.exports = {
  handleMessage,
  handleGroupUpdate,
  handleAntilink,
  handleAntigroupmention,
  initializeAntiCall,
  isOwner,
  isAdmin,
  isBotAdmin,
  isMod,
  getGroupMetadata,
  findParticipant
};