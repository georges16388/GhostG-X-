/**
 * SSWeb - AGM Screenshot Edition (Clean Elite)
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const APIs = require('../../utils/api');

const toStyledCaps = (text) => {
  if (!text) return "";
  const fonts = {'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
  return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

module.exports = {
  name: 'ssweb',
  aliases: ['screenshot', 'ss', 'webss'],
  category: 'utility',
  description: 'Prendre une capture d\'écran d\'un site web',
  usage: '.ssweb <url>',

  async execute(sock, msg, args, extra) {
    const { from, reply, react } = extra;
    try {
      let url = args[0]?.trim();
      if (!url) {
        return reply(`⚠️ *${toStyledCaps("veuillez specifier l'url d'un site web")}*`);
      }

      if (!url.startsWith('http')) url = 'https://' + url;

      await react('📸');

      const screenshotData = await APIs.screenshotWebsite(url);
      if (!screenshotData) throw new Error("ᴄᴀᴘᴛᴜʀᴇ ɪᴍᴘᴏssɪʙʟᴇ");

      // --- CONSTRUCTION DU DESIGN ÉPURÉ ---
      const cleanUrl = url.replace('https://', '').replace('http://', '').split('/')[0];
      const displayUrl = cleanUrl.length > 25 ? cleanUrl.substring(0, 22) + '...' : cleanUrl;

      let design = `*╭╼━≪• ${toStyledCaps('ᴡᴇʙ sᴄʀᴇᴇɴ sʜᴏᴛ')} •≫━╾╮*\n`;
      design += `*┃*\n`;
      design += `*┃* ✅ *${toStyledCaps('status')}* : 🟢 *${toStyledCaps('captured')}*\n`;
      design += `*┃* 🌐 *${toStyledCaps('target')}* : _${displayUrl}_\n`;
      design += `*┃* ⚡ *${toStyledCaps('mode')}* : *${toStyledCaps('system')}*\n`;
      design += `*┃*\n`;
      design += `*╰━━━━━━━━━━━━━━━╯*\n`;
      design += `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-x*`;

      // Envoi de la capture seule (SANS publicité externalAdReply)
      await sock.sendMessage(from, {
        image: Buffer.isBuffer(screenshotData) ? screenshotData : { url: screenshotData },
        caption: design,
        contextInfo: {
            isForwarded: true,
            forwardingScore: 999,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363425540434745@newsletter',
                newsletterName: "-ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ",
                serverMessageId: 143
            }
        }
      }, { quoted: msg });

      await react('✅');

    } catch (error) {
      console.error('SSWeb error:', error);
      reply(`❌ *${toStyledCaps("erreur systeme lors de la capture")}*`);
    }
  }
};
