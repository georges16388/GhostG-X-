module.exports = {
    name: 'groupinfo',
    aliases: ['info', 'ginfo', 'groupe'],
    category: 'essentials',
    description: 'Affiche les informations détaillées du groupe.',
    usage: '.groupinfo',
    groupOnly: true,

    async execute(sock, msg, args, extra) {
      try {
        const from = msg.key.remoteJid;
        
        // Sécurité : Récupération forcée si extra est vide
        const metadata = extra.groupMetadata || await sock.groupMetadata(from);
        const participants = metadata.participants || [];
        const admins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');

        await sock.sendMessage(from, { react: { text: "🏢", key: msg.key } });

        let ppUrl;
        try {
          ppUrl = await sock.profilePictureUrl(from, 'image');
        } catch {
          ppUrl = 'https://telegra.ph/file/b3138928493e78b55526f.jpg';
        }

        let text = `╭╼━≪• *ɢʜᴏsᴛ ɢʀᴏᴜᴘ ɪɴғᴏ* •≫━╾╮\n\n`;
        text += `┃ 🏷️ *ɴᴏᴍ :* ${metadata.subject}\n`;
        text += `┃ 🆔 *ɪᴅ :* ${from.split('@')[0]}\n`;
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

        text += `╰━━━━━━━━━━━━━━━╯\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`; // Correction des espaces ici

        await sock.sendMessage(from, {
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

        await sock.sendMessage(from, { react: { text: "✅", key: msg.key } });

      } catch (error) {
        console.error('GroupInfo Error:', error);
        // Utilisation de sock.sendMessage au cas où extra.reply échoue
        await sock.sendMessage(msg.key.remoteJid, { text: `❌ Erreur : Impossible de scanner le groupe.` }, { quoted: msg });
      }
    }
};
