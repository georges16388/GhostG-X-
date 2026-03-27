/**
 * Group Info Command - AGM System Core
 * Style requested by User (Ghost Group Info)
 * Powered by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

module.exports = {
    name: 'groupinfo',
    aliases: ['info', 'ginfo', 'group'],
    category: 'general',
    description: 'Affiche les informations détaillées du groupe avec liste des admins.',
    usage: '.groupinfo',
    groupOnly: true,

    async execute(sock, msg, args, { from, reply, react }) {
      try {
        await react('📋');

        // Récupération fraîche des métadonnées
        const metadata = await sock.groupMetadata(from);
        const participants = metadata.participants;
        const admins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');
        
        // Formatage de la date (Ouagadougou Time)
        const creationDate = new Date(metadata.creation * 1000).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          timeZone: 'Africa/Ouagadougou'
        });

        // --- CONSTRUCTION DU DESIGN DEMANDÉ ---
        let text = `╭╼━≪• *ɢʜᴏsᴛ ɢʀᴏᴜᴘ ɪɴғᴏ* •≫━╾╮\n`;
        text += `┃ 🏷️ *ɴᴏᴍ :* ${metadata.subject}\n`;
        text += `┃ 🆔 *ɪᴅ :* ${from.split('@')[0]}\n`;
        text += `┃ 👥 *ᴍᴇᴍʙʀᴇs :* ${participants.length}\n`;
        text += `┃ 👑 *ᴀᴅᴍɪɴs :* ${admins.length}\n`;
        text += `┃ 📅 *ᴄʀᴇᴀᴛɪᴏɴ :* ${creationDate}\n`;
        text += `┃ 🔒 *ʀᴇsᴛʀᴇɪɴᴛ :* ${metadata.announce ? 'Oui (Admins)' : 'Non (Tous)'}\n\n`;

        text += `┃ 📝 *ᴅᴇsᴄʀɪᴘᴛɪᴏɴ :*\n`;
        const desc = metadata.desc ? metadata.desc.toString() : 'Aucune description.';
        text += `┃ ${desc.slice(0, 150)}${desc.length > 150 ? '...' : ''}\n\n`;

        text += `┃ 👑 *ʟɪsᴛᴇ ᴅᴇs ᴀᴅᴍɪɴs :*\n`;
        // Limité à 15 pour éviter les messages trop longs sur WhatsApp
        admins.slice(0, 15).forEach((admin, index) => {
          text += `┃ ${index + 1}. @${admin.id.split('@')[0]}\n`;
        });

        if (admins.length > 15) {
          text += `┃ ... et ${admins.length - 15} autres admins.\n`;
        }

        text += `╰━━━━━━━━━━━━━━━╯\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

        // Envoi avec mentions des admins listés
        await sock.sendMessage(from, {
          text: text,
          mentions: admins.map(a => a.id),
          contextInfo: {
            externalAdReply: {
              title: "ɢʜᴏꜱᴛɢ-x ꜱʏꜱᴛᴇᴍ",
              body: `Total Membres: ${participants.length}`,
              mediaType: 1,
              thumbnailUrl: "https://files.catbox.moe/2fmwpu.jpg",
              sourceUrl: "https://github.com/georges16388/GhostG-X-"
            }
          }
        }, { quoted: msg });

      } catch (error) {
        console.error('[GROUPINFO ERROR]:', error);
        reply(`❌ *ᴇʀʀᴇᴜʀ sʏsᴛᴇ̀ᴍᴇ :* ${error.message}`);
      }
    }
};
