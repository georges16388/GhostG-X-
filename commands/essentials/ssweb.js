/**
 * SSWeb - AGM Screenshot Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const APIs = require('../../utils/api');

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

// --- FONCTION DE DESIGN AGM PRESTIGE (GRAS) ---
const AGM_DESIGN = (url) => {
  const cleanUrl = url.replace('https://', '').replace('http://', '').split('/')[0];
  const displayUrl = cleanUrl.length > 20 ? cleanUrl.substring(0, 17) + '...' : cleanUrl;

  return `*╭╼━≪• ${toStyledCaps('ᴡᴇʙ sᴄʀᴇᴇɴ sʜᴏᴛ')} •≫━╾╮*
*┃*
*┃* ✅ *${toStyledCaps('sᴛᴀᴛᴜs')}* : 🟢 *${toStyledCaps('ᴄᴀᴘᴛᴜʀᴇᴅ')}*
*┃* 🌐 *${toStyledCaps('ᴛᴀʀɢᴇᴛ')}* : *${toStyledCaps(displayUrl)}*
*┃* ⚡ *${toStyledCaps('ᴍᴏᴅᴇ')}* : *${toStyledCaps('sʏsᴛᴇᴍ')}*
*┃*
*╰━━━━━━━━━━━━━━━╯*
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
};

module.exports = {
  name: 'ssweb',
  aliases: ['screenshot', 'ss', 'webss'],
  category: 'utility',
  description: 'Prendre une capture d\'écran d\'un site web',
  usage: '.ssweb <url>',

  async execute(sock, msg, args, extra) {
    try {
      let url = args[0]?.trim();
      if (!url) {
        return extra.reply(`⚠️ *${toStyledCaps("ᴠᴇᴜɪʟʟᴇᴢ sᴘᴇᴄɪғɪᴇʀ ʟ'ᴜʀʟ ᴅ'ᴜɴ sɪᴛᴇ ᴡᴇʙ")}*`);
      }

      if (!url.startsWith('http')) url = 'https://' + url;

      await sock.sendMessage(extra.from, { react: { text: '📸', key: msg.key } });

      const screenshotData = await APIs.screenshotWebsite(url);
      if (!screenshotData) throw new Error("ᴄᴀᴘᴛᴜʀᴇ ɪᴍᴘᴏssɪʙʟᴇ");

      // Envoi avec design épuré (SANS showAdAttribution et SANS sourceUrl)
      await sock.sendMessage(extra.from, {
        image: Buffer.isBuffer(screenshotData) ? screenshotData : { url: screenshotData },
        caption: AGM_DESIGN(url),
        contextInfo: {
            externalAdReply: {
                title: toStyledCaps("ɢʜᴏsᴛ ᴡᴇʙ ᴄᴀᴘᴛᴜʀᴇ"),
                body: toStyledCaps("apercu du site web"),
                mediaType: 1,
                thumbnailUrl: "https://files.catbox.moe/2fmwpu.jpg",
                showAdAttribution: false // Désactivé pour cacher le lien
            }
        }
      }, { quoted: msg });

      await sock.sendMessage(extra.from, { react: { text: '✅', key: msg.key } });

    } catch (error) {
      console.error('SSWeb error:', error);
      await extra.reply(`❌ *${toStyledCaps("ᴇʀʀᴇᴜʀ sʏsᴛᴇᴍᴇ")}*`);
    }
  }
};
