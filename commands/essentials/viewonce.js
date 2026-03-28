/**
 * ViewOnce Reveal - GhostG-X MD
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

// --- FONCTION DE CONVERSION EN SMALL CAPS ---
const toStyledCaps = (text) => {
  if (!text) return "";
  const fonts = {
    'a': 'ᴀ','b': 'ʙ','c': 'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ',
    'i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ',
    'q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x',
    'y':'ʏ','z':'ᴢ'
  };
  return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

// --- FONCTION DE DESIGN AGM PRESTIGE (GRAS + SIGNATURE) ---
const AGM_DESIGN = (type, caption) => {
  const styledCaption = caption ? toStyledCaps(caption.length > 15 ? caption.substring(0, 12) + '...' : caption) : toStyledCaps('ɴᴏ ᴄᴀᴘᴛɪᴏɴ');
  
  return `*╭╼━≪• ${toStyledCaps('ᴠɪᴇᴡ-ᴏɴᴄᴇ ʀᴇᴠᴇᴀʟ')} •≫━╾╮*
*┃*
*┃* 📂 *${toStyledCaps('ᴛʏᴘᴇ')}* : *${toStyledCaps(type)}*
*┃* ✅ *${toStyledCaps('sᴛᴀᴛᴜs')}* : 🟢 *${toStyledCaps('ᴜɴʟᴏᴄᴋᴇᴅ')}*
*┃* 📝 *${toStyledCaps('ᴄᴀᴘᴛɪᴏɴ')}* : *${styledCaption}*
*┃* ⚡ *${toStyledCaps('ᴍᴏᴅᴇ')}* : *${toStyledCaps('ᴘʀᴇsᴛɪɢᴇ')}*
*┃*
*╰━━━━━━━━━━━━━━━╯*
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
};

module.exports = {
  name: 'viewonce',
  aliases: ['readvo', 'read', 'vv', 'readviewonce'],
  category: 'general',
  description: 'Révéler les messages à vue unique',
  usage: '.vv (répondre à un message View-Once)',

  async execute(sock, msg, args, { from, react }) {
    try {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      if (!quoted) {
        return sock.sendMessage(from, { text: `⚠️ *${toStyledCaps('ʀᴇᴘᴏɴᴅᴇᴢ ᴀ ᴜɴ ᴍᴇssᴀɢᴇ ᴀ ᴠᴜᴇ ᴜɴɪǫᴜᴇ')}*` }, { quoted: msg });
      }

      let viewOnceType = quoted.viewOnceMessageV2 || quoted.viewOnceMessageV2Extension || quoted.viewOnceMessage;
      let actualMsg = viewOnceType ? viewOnceType.message : quoted;

      const mtype = Object.keys(actualMsg)[0];
      const media = actualMsg[mtype];

      if (!media?.viewOnce && !viewOnceType) {
        return sock.sendMessage(from, { text: `❌ *${toStyledCaps('ᴄᴇ ɴᴇsᴛ ᴘᴀs ᴜɴ ᴍᴇssᴀɢᴇ ᴀ ᴠᴜᴇ ᴜɴɪǫᴜᴇ')}*` }, { quoted: msg });
      }

      await react('🔓');

      const downloadType = mtype.replace('Message', '');
      const stream = await downloadContentFromMessage(media, downloadType);

      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      const caption = media.caption || '';
      const displayType = mtype === 'imageMessage' ? 'ɪᴍᴀɢᴇ' : mtype === 'videoMessage' ? 'ᴠɪᴅᴇᴏ' : 'ᴀᴜᴅɪᴏ';
      const design = AGM_DESIGN(displayType, caption);

      if (/video/.test(mtype)) {
        await sock.sendMessage(from, {
          video: buffer,
          caption: design,
          mimetype: 'video/mp4'
        }, { quoted: msg });
      } else if (/image/.test(mtype)) {
        await sock.sendMessage(from, {
          image: buffer,
          caption: design,
          mimetype: 'image/jpeg'
        }, { quoted: msg });
      } else if (/audio/.test(mtype)) {
        await sock.sendMessage(from, {
          audio: buffer,
          ptt: true,
          mimetype: 'audio/ogg; codecs=opus'
        }, { quoted: msg });
        await sock.sendMessage(from, { text: design }, { quoted: msg });
      }

      await react('✅');

    } catch (error) {
      console.error('[VIEWONCE ERROR]:', error);
      await sock.sendMessage(from, { text: `❌ *${toStyledCaps('ᴇᴄʜᴇᴄ ᴅᴇ ʟᴀ ʀᴇᴠᴇʟᴀᴛɪᴏɴ')}*` }, { quoted: msg });
    }
  }
};
