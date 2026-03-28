/**
 * Group Info Command - AGM System Core
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

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

      // Récupération des données du groupe
      const metadata = await sock.groupMetadata(from);
      const participants = metadata.participants;
      const admins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');

      // Formatage de la date
      const creationDate = new Date(metadata.creation * 1000).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      // Traitement de la description pour l'intégrer au cadre
      const rawDesc = metadata.desc ? metadata.desc.toString() : 'ᴀᴜᴄᴜɴᴇ ᴅᴇsᴄʀɪᴘᴛɪᴏɴ.';
      const styledDesc = toStyledCaps(rawDesc).split('\n').map(line => `*┃* ${line}`).join('\n');

      // --- CONSTRUCTION DU DESIGN AGM ---
      let text = `*╭╼━≪• ${toStyledCaps('ɢʜᴏsᴛ ɢʀᴏᴜᴘ ɪɴғᴏ')} •≫━╾╮*\n`;
      text += `*┃*\n`;
      text += `*┃* 🏷️ *${toStyledCaps('ɴᴏᴍ')} :* *${toStyledCaps(metadata.subject)}*\n`;
      text += `*┃* 👥 *${toStyledCaps('ᴍᴇᴍʙʀᴇs')} :* *${participants.length}*\n`;
      text += `*┃* 👑 *${toStyledCaps('ᴀᴅᴍɪɴs')} :* *${admins.length}*\n`;
      text += `*┃* 📅 *${toStyledCaps('ᴄʀᴇᴀᴛɪᴏɴ')} :* *${toStyledCaps(creationDate)}*\n`;
      text += `*┃* 🔒 *${toStyledCaps('ʀᴇsᴛʀᴇɪɴᴛ')} :* *${metadata.announce ? 'ᴏᴜɪ' : 'ɴᴏɴ'}*\n`;
      text += `*┃*\n`;
      text += `*┃* 📝 *${toStyledCaps('ᴅᴇsᴄʀɪᴘᴛɪᴏɴ')} :*\n`;
      text += `${styledDesc}\n`;
      text += `*┃*\n`;
      text += `*┃* 👑 *${toStyledCaps('ʟɪsᴛᴇ ᴅᴇs ᴀᴅᴍɪɴs')} :*\n`;
      
      admins.slice(0, 10).forEach((admin, index) => {
        text += `*┃* ${index + 1}. @${admin.id.split('@')[0]}\n`;
      });

      if (admins.length > 10) {
        text += `*┃* ... ᴇᴛ ${admins.length - 10} ᴀᴜᴛʀᴇs.\n`;
      }
      
      text += `*┃*\n`;
      text += `*╰━━━━━━━━━━━━━━━╯*\n`;
      text += `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

      // Envoi sans lien catbox visible (thumbnail uniquement)
      await sock.sendMessage(from, {
        text: text,
        mentions: admins.map(a => a.id),
        contextInfo: {
          externalAdReply: {
            title: toStyledCaps(metadata.subject),
            body: `ɢʜᴏꜱᴛɢ-x ꜱʏꜱᴛᴇᴍ | ${participants.length} ᴍᴇᴍʙʀᴇs`,
            mediaType: 1,
            thumbnailUrl: "https://files.catbox.moe/2fmwpu.jpg",
            showAdAttribution: false,
            // On retire sourceUrl pour supprimer le lien cliquable parasite
          }
        }
      }, { quoted: msg });

    } catch (error) {
      console.error('[GROUPINFO ERROR]:', error);
    }
  }
};
