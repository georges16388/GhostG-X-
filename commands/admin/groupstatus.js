/**
 * Group Status Command - AGM Elite Edition
 * Post media or text to Group Status (V2)
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const { downloadContentFromMessage, generateWAMessageContent, generateWAMessageFromContent } = require('@whiskeysockets/baileys');
const crypto = require('crypto');
const ffmpeg = require('fluent-ffmpeg');
const { PassThrough } = require('stream');

// --- FONCTION DE CONVERSION EN SMALL CAPS ---
const toStyledCaps = (text) => {
  if (!text) return "";
  const fonts = {'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
  return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

const PURPLE_COLOR = '#9C27B0';

// --- DESIGN PRESTIGE ---
const STATUS_DESIGN = (type) => `*╭╼━≪• ${toStyledCaps('ɢʀᴏᴜᴘ sᴛᴀᴛᴜs')} •≫━╾╮*
*┃*
*┃* 📑 *${toStyledCaps('ᴛʏᴘᴇ')}* : *${toStyledCaps(type)}*
*┃* ✅ *${toStyledCaps('sᴛᴀᴛᴜs')}* : *${toStyledCaps('ᴘᴏsᴛᴇᴅ')}*
*┃* 👥 *${toStyledCaps('ᴛᴀʀɢᴇᴛ')}* : *${toStyledCaps('ɢʀᴏᴜᴘ')}*
*┃*
*╰━━━━━━━━━━━━━━━╯*`;

module.exports = {
  name: 'groupstatus',
  aliases: ['togstatus', 'swgc', 'gs', 'gstatus'],
  description: 'Poster un texte ou un média en statut de groupe.',
  usage: '.gs [texte] ou répondre à un média',
  category: 'admin',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args, { from, reply, react }) {
    try {
      const caption = (args.join(' ') || '').trim();
      const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;
      const quotedMsg = ctxInfo?.quotedMessage;

      await react('⏳');

      // --- CAS 1 : TEXTE UNIQUEMENT ---
      if (!quotedMsg) {
        if (!caption) {
          return reply(`⚠️ *${toStyledCaps('ᴠᴇᴜɪʟʟᴇᴢ ᴇɴᴛʀᴇʀ ᴜɴ ᴛᴇxᴛᴇ ᴏᴜ ʀᴇᴘᴏɴᴅʀᴇ ᴀ ᴜɴ ᴍᴇᴅɪᴀ')}*`);
        }
        await groupStatus(sock, from, { text: caption, backgroundColor: PURPLE_COLOR });
        await react('✅');
        return reply(STATUS_DESIGN('ᴛᴇxᴛ'));
      }

      // --- CAS 2 : MÉDIA CITÉ ---
      const mtype = Object.keys(quotedMsg)[0];
      const mediaData = quotedMsg[mtype];

      const downloadBuf = async () => {
        const stream = await downloadContentFromMessage(mediaData, mtype.replace('Message', ''));
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        return buffer;
      };

      const buf = await downloadBuf();
      if (!buf) throw new Error('ᴅᴏᴡɴʟᴏᴀᴅ_ꜰᴀɪʟᴇᴅ');

      if (/image/i.test(mtype)) {
        await groupStatus(sock, from, { image: buf, caption: caption });
        await reply(STATUS_DESIGN('ɪᴍᴀɢᴇ'));
      } else if (/video/i.test(mtype)) {
        await groupStatus(sock, from, { video: buf, caption: caption });
        await reply(STATUS_DESIGN('ᴠɪᴅᴇᴏ'));
      } else if (/audio/i.test(mtype)) {
        const vn = await toVN(buf);
        const waveform = await generateWaveform(buf);
        await groupStatus(sock, from, { audio: vn, mimetype: 'audio/ogg; codecs=opus', ptt: true, waveform });
        await reply(STATUS_DESIGN('ᴀᴜᴅɪᴏ'));
      } else {
        return reply(`❌ *${toStyledCaps('ꜰᴏʀᴍᴀᴛ ɴᴏɴ sᴜᴘᴘᴏʀᴛᴇ')}*`);
      }

      await react('✅');

    } catch (e) {
      console.error(e);
      await reply(`❌ *${toStyledCaps('ᴇᴄʜᴇᴄ ᴅᴇ ʟᴀ ᴘᴜʙʟɪᴄᴀᴛɪᴏɴ')}*`);
    }
  }
};

// ---- HELPERS CORE ----

async function groupStatus(sock, jid, content) {
  const { backgroundColor } = content;
  const contentToUpload = { ...content };
  delete contentToUpload.backgroundColor;

  const inside = await generateWAMessageContent(contentToUpload, {
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
        resolve(Buffer.from(avg.map((v) => Math.floor((v / max) * 100))).toString('base64'));
      }).pipe().on('data', (c) => chunks.push(c));
  });
}
