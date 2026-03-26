/**
 * Group Info Command - Display group information
 * Custom Design & Category by -ɢʜᴏsᴛɢ 𝐗
 */

module.exports = {
    name: 'groupinfo',
    aliases: ['info', 'ginfo', 'groupe'],
    category: 'essentials',
    description: 'Affiche les informations détaillées du groupe.',
    usage: '.groupinfo',
    groupOnly: true,
    
    async execute(sock, msg, args, extra) {
      try {
        const metadata = extra.groupMetadata;
        const participants = metadata.participants;
        const admins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');
        
        // Réaction de scan
        await sock.sendMessage(extra.from, { react: { text: "🏢", key: msg.key } });

        // Récupération de l'image du groupe
        let ppUrl;
        try {
          ppUrl = await sock.profilePictureUrl(extra.from, 'image');
        } catch {
          ppUrl = 'https://telegra.ph/file/b3138928493e78b55526f.jpg'; // Image par défaut
        }

        let text = `╭╼━≪• ɢʜᴏsᴛ ɢʀᴏᴜᴘ ɪɴғᴏ •≫━╾╮\n\n`;
        text += `┃ 🏷️ *ɴᴏᴍ :* ${metadata.subject}\n`;
        text += `┃ 🆔 *ɪᴅ :* ${metadata.id.split('@')[0]}\n`;
        text += `┃ 👥 *ᴍᴇᴍʙʀᴇs :* ${participants.length}\n`;
        text += `┃ 👑 *ᴀᴅᴍɪɴs :* ${admins.length}\n`;
        text += `┃ 📅 *ᴄʀᴇᴀᴛɪᴏɴ :* ${new Date(metadata.creation * 1000).toLocaleDateString('fr-FR')}\n`;
        text += `┃ 🔒 *ʀᴇsᴛʀᴇɪɴᴛ :* ${metadata.announce ? 'Oui (Admins)' : 'Non (Tous)'}\n\n`;
        
        text += `┃ 📝 *ᴅᴇsᴄʀɪᴘᴛɪᴏɴ :*\n`;
        text += `┃ ${metadata.desc?.toString().slice(0, 200) || 'Aucune description.'}\n\n`;
        
        text += `┃ 👑 *ʟɪsᴛᴇ ᴅᴇs ᴀᴅᴍɪɴs :*\n`;
        admins.forEach((admin, index) => {
          text += `┃ ${index + 1}. @${admin.id.split('@')[0]}\n`;
        });
        
        text += `╰━━━━━━━━━━━━━━━╯
               > *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

        await sock.sendMessage(extra.from, {
          image: { url: ppUrl },
          caption: text,
          mentions: admins.map(a => a.id),
          contextInfo: {
            externalAdReply: {
              title: "GHOST GROUP ANALYZER",
              body: `Subject: ${metadata.subject}`,
              mediaType: 1,
              thumbnailUrl: ppUrl,
              renderLargerThumbnail: false
            }
          }
        }, { quoted: msg });

        await sock.sendMessage(extra.from, { react: { text: "✅", key: msg.key } });
        
      } catch (error) {
        console.error('GroupInfo Error:', error);
        await extra.reply(`❌ Erreur : Impossible de scanner le groupe.`);
      }
    }
  };
