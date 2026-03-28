/**
 * Support Command - AGM HQ (Elite Edition)
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const toStyledCaps = (text) => {
  if (!text) return "";
  const fonts = {'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
  return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

module.exports = {
  name: 'support',
  aliases: ['group', 'aide', 'hq'],
  category: 'essentials',
  description: 'Affiche le lien du groupe de support officiel',
  usage: '.support',

  async execute(sock, msg, args, extra) {
    const { from, react } = extra;
    const supportLink = "https://chat.whatsapp.com/JuhRb0BfN9uBkMBQmwZhIf";
    const groupJid = "120363297754668271@g.us"; // JID de ton groupe (déduit du lien)

    try {
      await react('🫂');

      // 1. Récupération dynamique de la photo du groupe de support
      let supportPP;
      try {
        // On essaie de récupérer la PP du groupe via son JID
        supportPP = await sock.profilePictureUrl(groupJid, 'image');
      } catch {
        // Image de secours si la PP est privée ou introuvable
        supportPP = "https://files.catbox.moe/2fmwpu.jpg";
      }

      // 2. Construction du Design Prestige
      let design = `*╭╼━≪• ${toStyledCaps('ɢʜᴏsᴛɢ x sᴜᴘᴘᴏʀᴛ')} •≫━╾╮*\n`;
      design += `*┃* 👤 *${toStyledCaps('owner')}* : *ɢʜᴏꜱᴛɢ x*\n`;
      design += `*┃* 🌐 *${toStyledCaps('group')}* : *${toStyledCaps('community')}*\n`;
      design += `*┃* ✅ *${toStyledCaps('status')}* : 🟢 *${toStyledCaps('online')}*\n`;
      design += `*╰━━━━━━━━━━━━━━━╯*\n\n`;
      design += `*${toStyledCaps('rejoignez notre communaute')} :*\n`;
      design += `${supportLink}\n\n`;
      design += `_“${toStyledCaps("besoin d'aide ou de nouveaux effets ? on vous attend !")}”_\n\n`;
      design += `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-x*`;

      // 3. Envoi de l'IMAGE DU GROUPE avec le texte en légende
      await sock.sendMessage(from, {
        image: { url: supportPP },
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

    } catch (error) {
      console.error('Error in support command:', error);
      // Envoi simple en cas d'erreur majeure
      await sock.sendMessage(from, { text: `❌ *${toStyledCaps("erreur support system")}*` });
    }
  }
};
