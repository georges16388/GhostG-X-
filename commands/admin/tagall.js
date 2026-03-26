/**
 * Tag All Command - Mention all group members
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

module.exports = {
    name: 'tagall',
    aliases: ['mentionall', 'everyone', 'all'],
    category: 'admin',
    description: 'Taguer tous les membres du groupe',
    usage: '.tagall <message>',
    groupOnly: true,
    adminOnly: true,
    botAdminNeeded: true,

    async execute(sock, msg, args, extra) {
      try {
        const from = msg.key.remoteJid;
        
        // 1. Récupération dynamique des métadonnées (plus fiable)
        const metadata = await sock.groupMetadata(from);
        const participants = metadata.participants;
        const participantIds = participants.map(p => p.id);

        const message = args.join(' ') || 'ᴀᴛᴛᴇɴᴛɪᴏɴ ᴛᴏᴜᴛ ʟᴇ ᴍᴏɴᴅᴇ !';

        // 2. Design AGM System
        let text = `╭╼━≪• ɢʀᴏᴜᴘ ᴀɴɴᴏᴜɴᴄᴇᴍᴇɴᴛ •≫━╾╮\n`;
        text += `┃ ᴍsɢ : ${message}\n`;
        text += `┃ ᴛᴏᴛᴀʟ : ${participants.length} ᴍᴇᴍʙᴇʀs\n`;
        text += `╰━━━━━━━━━━━━━━━╯\n\n`;

        // 3. Construction de la liste avec mentions
        participants.forEach((mem, index) => {
          text += `  ${index + 1}. @${mem.id.split('@')[0]}\n`;
        });

        text += `\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

        // 4. Envoi avec le tableau de mentions (crucial pour que les gens reçoivent la notif)
        await sock.sendMessage(from, {
          text: text,
          mentions: participantIds
        }, { quoted: msg });

        // Petit emoji de confirmation
        await sock.sendMessage(from, { react: { text: '📢', key: msg.key } });

      } catch (error) {
        console.error('TagAll Error:', error);
        // Utilisation de sock.sendMessage si extra.reply n'est pas défini
        await sock.sendMessage(msg.key.remoteJid, { text: `❌ *ᴇʀʀᴇᴜʀ sʏsᴛᴇ̀ᴍᴇ* : ${error.message}` }, { quoted: msg });
      }
    }
  };
