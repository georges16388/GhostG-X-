module.exports = {
    name: 'groupinfo',
    aliases: ['info', 'ginfo', 'groupe'],
    category: 'essentials',
    description: 'Affiche les informations détaillées du groupe.',
    usage: '.groupinfo',
    groupOnly: true,

    async execute(sock, msg, args, extra) {
      const from = msg.key.remoteJid;
      try {
        await sock.sendMessage(from, { react: { text: "🏢", key: msg.key } });

        // Sécurité : Récupération des métadonnées
        const metadata = await sock.groupMetadata(from).catch(() => null);
        if (!metadata) return sock.sendMessage(from, { text: "❌ Impossible de récupérer les infos du groupe." });

        const participants = metadata.participants || [];
        const admins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');
        const creationDate = new Date(metadata.creation * 1000).toLocaleDateString('fr-FR', { timeZone: 'Africa/Ouagadougou' });

        // Photo de profil sécurisée
        let ppUrl;
        try {
          ppUrl = await sock.profilePictureUrl(from, 'image');
        } catch {
          ppUrl = 'https://files.catbox.moe/2fmwpu.jpg'; // Utilisation de ton logo par défaut
        }

        // Construction du texte (Design GHOSTG)
        let text = `╭╼━≪• *ɢʜᴏsᴛ ɢʀᴏᴜᴘ ɪɴғᴏ* •≫━╾╮\n\n`;
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
        admins.slice(0, 15).forEach((admin, index) => { // Limité à 15 pour éviter les messages trop longs
          text += `┃ ${index + 1}. @${admin.id.split('@')[0]}\n`;
        });

        text += `╰━━━━━━━━━━━━━━━╯\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

        // Envoi avec image et mentions
        await sock.sendMessage(from, {
          image: { url: ppUrl },
          caption: text,
          mentions: admins.map(a => a.id),
          contextInfo: {
            externalAdReply: {
              title: "ɢʜᴏsᴛ ɢʀᴏᴜᴘ ᴀɴᴀʟʏᴢᴇʀ",
              body: `📌 ${metadata.subject}`,
              mediaType: 1,
              thumbnailUrl: ppUrl,
              sourceUrl: "https://whatsapp.com/channel/0029VbCFj3oKbYMVXaqyHq3c"
            }
          }
        }, { quoted: msg });

        await sock.sendMessage(from, { react: { text: "✅", key: msg.key } });

      } catch (error) {
        console.error('GroupInfo Error:', error);
        await sock.sendMessage(from, { text: `❌ *ᴇʀʀᴇᴜʀ* : Analyse du groupe échouée.` }, { quoted: msg });
      }
    }
};
