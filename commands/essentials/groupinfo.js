/**
 * Group Info Command - AGM System Core
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const toStyledCaps = (text) => {
  if (!text) return "";
  const fonts = {'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
  return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

module.exports = {
  name: 'groupinfo',
  aliases: ['info', 'ginfo', 'group'],
  category: 'general',
  description: 'Affiche les informations détaillées du groupe.',
  usage: '.groupinfo',
  groupOnly: true,

  async execute(sock, msg, args, { from, react }) {
    try {
      await react('📋');

      // 1. Récupération des données du groupe
      const metadata = await sock.groupMetadata(from);
      const participants = metadata.participants;
      const admins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');

      // 2. Récupération de la photo du groupe (Dynamique)
      let groupPP;
      try {
        groupPP = await sock.profilePictureUrl(from, 'image');
      } catch {
        groupPP = "https://files.catbox.moe/2fmwpu.jpg"; // Image de secours
      }

      const creationDate = new Date(metadata.creation * 1000).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      const rawDesc = metadata.desc ? metadata.desc.toString() : 'ᴀᴜᴄᴜɴᴇ ᴅᴇsᴄʀɪᴘᴛɪᴏɴ.';
      const styledDesc = toStyledCaps(rawDesc).split('\n').map(line => `*┃* ${line}`).join('\n');

      // 3. CONSTRUCTION DU DESIGN AGM
      let text = `*╭╼━≪• ${toStyledCaps('ɢʜᴏsᴛ ɢʀᴏᴜᴘ ɪɴғᴏ')} •≫━╾╮*\n`;
      text += `*┃*\n`;
      text += `*┃* 🏷️ *${toStyledCaps('nom')} :* *${metadata.subject}*\n`;
      text += `*┃* 👥 *${toStyledCaps('membres')} :* *${participants.length}*\n`;
      text += `*┃* 👑 *${toStyledCaps('admins')} :* *${admins.length}*\n`;
      text += `*┃* 📅 *${toStyledCaps('creation')} :* *${toStyledCaps(creationDate)}*\n`;
      text += `*┃* 🔒 *${toStyledCaps('restreint')} :* *${metadata.announce ? 'ᴏᴜɪ' : 'ɴᴏɴ'}*\n`;
      text += `*┃*\n`;
      text += `*┃* 📝 *${toStyledCaps('description')} :*\n`;
      text += `${styledDesc}\n`;
      text += `*┃*\n`;
      text += `*┃* 👑 *${toStyledCaps('liste des admins')} :*\n`;

      admins.slice(0, 10).forEach((admin, index) => {
        text += `*┃* ${index + 1}. @${admin.id.split('@')[0]}\n`;
      });

      if (admins.length > 10) {
        text += `*┃* ... ᴇᴛ ${admins.length - 10} ᴀᴜᴛʀᴇs.\n`;
      }

      text += `*┃*\n`;
      text += `*╰━━━━━━━━━━━━━━━╯*\n`;
      text += `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

      // 4. ENVOI AVEC L'IMAGE DU GROUPE
      await sock.sendMessage(from, {
        image: { url: groupPP },
        caption: text,
        mentions: admins.map(a => a.id),
        contextInfo: {
            isForwarded: true,
            forwardingScore: 999,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363425540434745@newsletter',
              newsletterName: "-ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ",
              serverMessageId: 143
            },
          externalAdReply: {
            title: toStyledCaps(metadata.subject),
            body: `ɢʜᴏꜱᴛɢ-x ꜱʏꜱᴛᴇᴍ | ${participants.length} ᴍᴇᴍʙʀᴇs`,
            mediaType: 1,
            thumbnailUrl: groupPP,
            showAdAttribution: false,
          }
        }
      }, { quoted: msg });

    } catch (error) {
      console.error('[GROUPINFO ERROR]:', error);
      await sock.sendMessage(from, { text: `❌ *${toStyledCaps("erreur lors de la recuperation des infos")}*` });
    }
  }
};
