/**
 * SSWeb - AGM Screenshot Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const APIs = require('../../utils/api');

// Fonction de conversion en Small Caps
const toSmallCaps = (text) => {
    const smallCapsMap = {
        'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 
        'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 
        'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 
        'y': 'ʏ', 'z': 'ᴢ'
    };
    return text.toString().toLowerCase().split('').map(char => smallCapsMap[char] || char).join('');
};

// --- FONCTION DE DESIGN AGM ADAPTÉE ---
const AGM_DESIGN = (url) => {
  // Nettoyage de l'URL pour l'affichage
  const cleanUrl = url.replace('https://', '').replace('http://', '').split('/')[0];
  const displayUrl = cleanUrl.length > 20 ? cleanUrl.substring(0, 17) + '...' : cleanUrl;

  return `╭╼━≪• *ᴡᴇʙ sᴄʀᴇᴇɴsʜᴏᴛ* •≫━╾╮
┃ 
┃ ${toSmallCaps('sᴛᴀᴛᴜs')} : 🟢 ${toSmallCaps('ᴄᴀᴘᴛᴜʀᴇᴅ')}
┃ ${toSmallCaps('ᴛᴀʀɢᴇᴛ')} : ${displayUrl}
┃ ${toSmallCaps('ᴍᴏᴅᴇ')} : ${toSmallCaps('sʏsᴛᴇᴍ')} ⚡
┃ 
╰━━━━━━━━━━━━━━━╯
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
      if (args.length === 0) {
        const warn = toSmallCaps("veuillez specifier l'url d'un site web");
        return extra.reply(`⚠️ *${warn}*`);
      }

      let url = args[0].trim();

      // Auto-fix URL si le préfixe manque
      if (!url.startsWith('http')) {
        url = 'https://' + url;
      }

      // Réaction de chargement (Appareil photo)
      await sock.sendMessage(extra.from, {
        react: { text: '📸', key: msg.key }
      });

      // Capture via ton utilitaire API (Assure-toi qu'il renvoie un Buffer ou une URL d'image)
      const screenshotData = await APIs.screenshotWebsite(url);

      if (!screenshotData) throw new Error(toSmallCaps('impossible de capturer le site'));

      // Envoi de l'image avec la légende AGM
      await sock.sendMessage(extra.from, {
        image: Buffer.isBuffer(screenshotData) ? screenshotData : { url: screenshotData },
        caption: AGM_DESIGN(url),
        contextInfo: {
            externalAdReply: {
                title: "ɢʜᴏsᴛ ᴡᴇʙ ᴄᴀᴘᴛᴜʀᴇ",
                body: toSmallCaps("apercu du site web"),
                mediaType: 1,
                thumbnailUrl: "https://files.catbox.moe/2fmwpu.jpg",
                showAdAttribution: true
            }
        }
      }, { quoted: msg });

      // Réaction de succès
      await sock.sendMessage(extra.from, {
        react: { text: '✅', key: msg.key }
      });

    } catch (error) {
      console.error('SSWeb command error:', error);
      const errMsg = toSmallCaps(`erreur : ${error.message}`);
      await extra.reply(`❌ *${errMsg}*`);
    }
  }
};
