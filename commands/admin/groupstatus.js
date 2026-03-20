const crypto = require('crypto');
const {
  generateWAMessageContent,
  generateWAMessageFromContent,
  downloadContentFromMessage,
} = require('@whiskeysockets/baileys');
const { PassThrough } = require('stream');
const ffmpeg = require('fluent-ffmpeg');

// Single default color for text statuses (purple)
const PURPLE_COLOR = '#9C27B0';

// Design pour les confirmations de statut
const STATUS_DESIGN = (type) => `╭╼━≪• ɢʀᴏᴜᴘ sᴛᴀᴛᴜs •≫━╾╮
┃ ᴛʏᴘᴇ : ${type.toUpperCase()} 📑
┃ sᴛᴀᴛᴜs : ᴘᴏsᴛᴇᴅ ✅
┃ ᴛᴀʀɢᴇᴛ : ɢʀᴏᴜᴘ 👥
╰━━━━━━━━━━━━━━━╯`;

module.exports = {
  name: 'groupstatus',
  aliases: ['togstatus', 'swgc', 'gs', 'gstatus'],
  description: 'Post replied media or text as a WhatsApp group status.',
  usage: '.groupstatus [caption]',
  category: 'admin',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args, extra) {
    try {
      const from = extra.from;

      if (!extra.isGroup) {
        return extra.reply('👥 This command can only be used in groups.');
      }

      const caption = (args.join(' ') || '').trim();
      const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;
      const hasQuoted = !!ctxInfo?.quotedMessage;

      // CASE 1: No quoted message -> treat as TEXT
      if (!hasQuoted) {
        if (!caption) {
          return extra.reply(
            `╭╼━≪• ɢʀᴏᴜᴘ sᴛᴀᴛᴜs •≫━╾╮\n` +
            `┃ ᴜsᴀɢᴇ : .ɢs <ᴛᴇxᴛ>\n` +
            `┃ ᴏʀ ʀᴇᴘʟʏ ᴛᴏ ᴍᴇᴅɪᴀ 📸\n` +
            `╰━━━━━━━━━━━━━━━╯`
          );
        }

        await extra.reply('⏳ Posting text group status...');

        try {
          await groupStatus(sock, from, {
            text: caption,
            backgroundColor: PURPLE_COLOR,
          });
          return extra.reply(STATUS_DESIGN('text'));
        } catch (e) {
          return extra.reply('❌ Failed: ' + (e.message || e));
        }
      }

      // CASE 2: Quoted media
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
        const type = /image/i.test(mtype) ? 'image' : /video/i.test(mtype) ? 'video' : /audio/i.test(mtype) ? 'audio' : /sticker/i.test(mtype) ? 'sticker' : null;
        if (!type) return null;
        
        const stream = await downloadContentFromMessage(qmsg[mtype] || qmsg, type);
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        return Buffer.concat(chunks);
      };

      // IMAGE / STICKER
      if (/image|sticker/i.test(mtype)) {
        await extra.reply('⏳ Posting image group status...');
        const buf = await downloadBuf();
        if (!buf) return extra.reply('❌ Download failed');

        try {
          await groupStatus(sock, from, { image: buf, caption: caption || '' });
          return extra.reply(STATUS_DESIGN('image'));
        } catch (e) { return extra.reply('❌ Error: ' + e.message); }
      }

      // VIDEO
      if (/video/i.test(mtype)) {
        await extra.reply('⏳ Posting video group status...');
        const buf = await downloadBuf();
        if (!buf) return extra.reply('❌ Download failed');

        try {
          await groupStatus(sock, from, { video: buf, caption: caption || '' });
          return extra.reply(STATUS_DESIGN('video'));
        } catch (e) { return extra.reply('❌ Error: ' + e.message); }
      }

      // AUDIO
      if (/audio/i.test(mtype)) {
        await extra.reply('⏳ Posting audio group status...');
        const buf = await downloadBuf();
        if (!buf) return extra.reply('❌ Download failed');

        try {
          const vn = await toVN(buf);
          const waveform = await generateWaveform(buf);
          await groupStatus(sock, from, {
            audio: vn,
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true,
            waveform,
          });
          return extra.reply(STATUS_DESIGN('audio'));
        } catch (e) { return extra.reply('❌ Error: ' + e.message); }
      }

      return extra.reply('❌ Unsupported media type.');
    } catch (e) {
      return extra.reply('❌ Error: ' + (e.message || e));
    }
  },
};

// ---- Helpers (Inchangés pour préserver la fonctionnalité) ----

async function groupStatus(sock, jid, content) {
  const { backgroundColor } = content;
  delete content.backgroundColor;
  const inside = await generateWAMessageContent(content, {
    upload: sock.waUploadToServer,
    backgroundColor: backgroundColor || PURPLE_COLOR,
  });
  const secret = crypto.randomBytes(32);
  const msg = generateWAMessageFromContent(jid, {
    messageContextInfo: { messageSecret: secret },
    groupStatusMessageV2: {
      message: { ...inside, messageContextInfo: { messageSecret: secret } },
    },
  }, {});
  await sock.relayMessage(jid, msg.message, { messageId: msg.key.id });
  return msg;
}

function toVN(buffer) {
  return new Promise((resolve, reject) => {
    const input = new PassThrough();
    const output = new PassThrough();
    const chunks = [];
    input.end(buffer);
    ffmpeg(input).noVideo().audioCodec('libopus').format('ogg').audioChannels(1).audioFrequency(48000)
      .on('error', reject).on('end', () => resolve(Buffer.concat(chunks))).pipe(output);
    output.on('data', (c) => chunks.push(c));
  });
}

function generateWaveform(buffer, bars = 64) {
  return new Promise((resolve, reject) => {
    const input = new PassThrough();
    input.end(buffer);
    const chunks = [];
    ffmpeg(input).audioChannels(1).audioFrequency(16000).format('s16le')
      .on('error', reject).on('end', () => {
        const raw = Buffer.concat(chunks);
        const samples = raw.length / 2;
        const amps = [];
        for (let i = 0; i < samples; i++) amps.push(Math.abs(raw.readInt16LE(i * 2)) / 32768);
        const size = Math.floor(amps.length / bars);
        if (size === 0) return resolve(undefined);
        const avg = Array.from({ length: bars }, (_, i) => amps.slice(i * size, (i + 1) * size).reduce((a, b) => a + b, 0) / size);
        const max = Math.max(...avg);
        if (max === 0) return resolve(undefined);
        resolve(Buffer.from(avg.map((v) => Math.floor((v / max) * 100))).toString('base64'));
      }).pipe().on('data', (c) => chunks.push(c));
  });
}
