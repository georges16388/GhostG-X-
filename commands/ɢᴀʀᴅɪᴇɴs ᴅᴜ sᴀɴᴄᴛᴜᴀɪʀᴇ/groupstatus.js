const crypto = require('crypto');
const {
  generateWAMessageContent,
  generateWAMessageFromContent,
  downloadContentFromMessage,
} = require('@whiskeysockets/baileys');
const { PassThrough } = require('stream');
const ffmpeg = require('fluent-ffmpeg');
const config = require('../../config.js');

// Single default color for text statuses (purple)
const PURPLE_COLOR = '#9C27B0';

module.exports = {
  name: 'groupstatus',
  aliases: ['togstatus', 'swgc', 'gs', 'gstatus'],
  description: 'Post replied media or text as a WhatsApp group status (new Group Status feature).',
  usage: '.groupstatus [caption]  (reply to image/video/audio) OR .groupstatus your text',
  category: '‎⛨ ɢᴀʀᴅɪᴇɴs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args, extra) {
    const prefix = config.prefix || '.';
    try {
      const from = extra.from;

      // Only inside groups
      if (!extra.isGroup) {
        return extra.reply('👥 Cette commande ne peut être utilisée que dans les groupes.');
      }

      const caption = (args.join(' ') || '').trim();

      const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;
      const hasQuoted = !!ctxInfo?.quotedMessage;

      // CASE 1: No quoted message -> treat as TEXT group status
      if (!hasQuoted) {
        if (!caption) {
          return extra.reply(
            `╭╼━≪• *ᴀʀᴄᴀɴᴇ_sᴛᴀᴛᴜᴛ* •≫━╾╮\n` +
            `┃ *ᴇ́ᴛᴀᴛ* : ᴀᴛᴛᴇɴᴛᴇ ⏳\n` +
            `╰━━━━━━━━━━━━━━━╯\n\n` +
            `🔮 *ɪɴᴄᴀɴᴛᴀᴛɪᴏɴ :*\n` +
            `*ᴄᴇᴛ ᴀʀᴄᴀɴᴇ ᴘᴜʙʟɪᴇ ᴅᴇs sᴛᴀᴛᴜᴛs ᴅɪʀᴇᴄᴛᴇᴍᴇɴᴛ ᴅᴀɴs ʟᴇ sᴀɴᴄᴛᴜᴀɪʀᴇ.*\n\n` +
            `  ${prefix}groupstatus <texte>\n` +
            `  ${prefix}groupstatus (en répondant à un média)\n\n` +
            `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
          );
        }

        await extra.reply('⏳ Publication du statut textuel en cours...');

        try {
          await groupStatus(sock, from, {
            text: caption,
            backgroundColor: PURPLE_COLOR,
          });
          
          return extra.reply(
            `╭╼━≪• *ᴀʀᴄᴀɴᴇ_sᴛᴀᴛᴜᴛ* •≫━╾╮\n` +
            `┃ *ᴇ́ᴛᴀᴛ* : ᴛᴇʀᴍɪɴᴇ́ ✅\n` +
            `╰━━━━━━━━━━━━━━━╯\n\n` +
            `*ʟ'ᴀʀᴄᴀɴᴇ ᴀ ᴘᴜʙʟɪᴇ ʟᴇ sᴛᴀᴛᴜᴛ ᴛᴇxᴛᴜᴇʟ ᴀᴠᴇᴄ sᴜᴄᴄᴇs.*\n\n` +
            `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
          );
        } catch (e) {
          console.error('groupstatus text error:', e);
          return extra.reply(`*❌ ᴇ́ᴄʜᴇᴄ de la publication :* ` + (e.message || e));
        }
      }

      // CASE 2: Quoted media -> image/video/audio group status
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
        await extra.reply('⏳ Publication de l\'image en statut...');
        let buf;
        try {
          buf = await downloadBuf();
        } catch {
          return extra.reply('*❌ ᴇ́ᴄʜᴇᴄ du téléchargement de l\'image.*');
        }
        if (!buf) return extra.reply('*❌ Impossible de télécharger l\'image.*');

        try {
          await groupStatus(sock, from, {
            image: buf,
            caption: caption || '',
          });
          
          return extra.reply(
            `╭╼━≪• *ᴀʀᴄᴀɴᴇ_sᴛᴀᴛᴜᴛ* •≫━╾╮\n` +
            `┃ *ᴇ́ᴛᴀᴛ* : ᴛᴇʀᴍɪɴᴇ́ ✅\n` +
            `╰━━━━━━━━━━━━━━━╯\n\n` +
            `*ʟ'ᴀʀᴄᴀɴᴇ ᴀ ᴘᴜʙʟɪᴇ ʟ'ɪᴍᴀɢᴇ ᴀᴠᴇᴄ sᴜᴄᴄᴇs.*\n\n` +
            `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
          );
        } catch (e) {
          console.error('groupstatus image error:', e);
          return extra.reply(`*❌ ᴇ́ᴄʜᴇᴄ de la publication :* ` + (e.message || e));
        }
      }

      // VIDEO
      if (/video/i.test(mtype)) {
        await extra.reply('⏳ Publication de la vidéo en statut...');
        let buf;
        try {
          buf = await downloadBuf();
        } catch {
          return extra.reply('*❌ ᴇ́ᴄʜᴇᴄ du téléchargement de la vidéo.*');
        }
        if (!buf) return extra.reply('*❌ Impossible de télécharger la vidéo.*');

        try {
          await groupStatus(sock, from, {
            video: buf,
            caption: caption || '',
          });
          
          return extra.reply(
            `╭╼━≪• *ᴀʀᴄᴀɴᴇ_sᴛᴀᴛᴜᴛ* •≫━╾╮\n` +
            `┃ *ᴇ́ᴛᴀᴛ* : ᴛᴇʀᴍɪɴᴇ́ ✅\n` +
            `╰━━━━━━━━━━━━━━━╯\n\n` +
            `*ʟ'ᴀʀᴄᴀɴᴇ ᴀ ᴘᴜʙʟɪᴇ ʟᴀ ᴠɪᴅᴇᴏ ᴀᴠᴇᴄ sᴜᴄᴄᴇs.*\n\n` +
            `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
          );
        } catch (e) {
          console.error('groupstatus video error:', e);
          return extra.reply(`*❌ ᴇ́ᴄʜᴇᴄ de la publication :* ` + (e.message || e));
        }
      }

      // AUDIO
      if (/audio/i.test(mtype)) {
        await extra.reply('⏳ Publication de l\'audio en statut...');
        let buf;
        try {
          buf = await downloadBuf();
        } catch {
          return extra.reply('*❌ ᴇ́ᴄʜᴇᴄ du téléchargement de l\'audio.*');
        }
        if (!buf) return extra.reply('*❌ Impossible de télécharger l\'audio.*');

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
          
          return extra.reply(
            `╭╼━≪• *ᴀʀᴄᴀɴᴇ_sᴛᴀᴛᴜᴛ* •≫━╾╮\n` +
            `┃ *ᴇ́ᴛᴀᴛ* : ᴛᴇʀᴍɪɴᴇ́ ✅\n` +
            `╰━━━━━━━━━━━━━━━╯\n\n` +
            `*ʟ'ᴀʀᴄᴀɴᴇ ᴀ ᴘᴜʙʟɪᴇ ʟ'ᴀᴜᴅɪᴏ ᴀᴠᴇᴄ sᴜᴄᴄᴇs.*\n\n` +
            `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
          );
        } catch (e) {
          console.error('groupstatus audio error:', e);
          return extra.reply(`*❌ ᴇ́ᴄʜᴇᴄ de la publication :* ` + (e.message || e));
        }
      }

      return extra.reply('*❓ Type de média non supporté. Réponds à une image, une vidéo ou un audio.*');
    } catch (e) {
      console.error('groupstatus command error (outer):', e);
      return extra.reply(`*❌ ᴇ́ᴄʜᴇᴄ :* ` + (e.message || e));
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

// 🎯 FONCTION CORRIGÉE POUR L'ENVOI EFFECTIF
async function groupStatus(sock, jid, content) {
  const { backgroundColor } = content;
  delete content.backgroundColor;

  // 1. Génération du contenu brut du message
  const inside = await generateWAMessageContent(content, {
    upload: sock.waUploadToServer,
    backgroundColor: backgroundColor || PURPLE_COLOR,
  });

  const secret = crypto.randomBytes(32);

  // 2. Construction d'un message structuré avec les données de chiffrement
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

  // 3. Forçage de l'envoi via relayMessage en spécifiant le type 4 (Data broadcast)
  await sock.relayMessage(jid, msg.message, { 
    messageId: msg.key.id,
    participant: { jid },
    additionalAttributes: {
      type: '4' // Force le décodage en tant que message de statut par le serveur WhatsApp
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
