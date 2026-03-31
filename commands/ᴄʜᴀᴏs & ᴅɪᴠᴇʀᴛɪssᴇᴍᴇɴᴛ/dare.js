/**
 * Dare - Get a random dare challenge
 */

module.exports = {
    name: 'ᴇᴘʀᴇᴜᴠᴇ',
    aliases: ['dare', 'defi', 'défis', 'épreuve', 'epreuve'],
    category: '♞  ᴄʜᴀᴏs & ᴅɪᴠᴇʀᴛɪssᴇᴍᴇɴᴛ',
    desc: 'Get a random dare challenge',
    usage: 'ᴇᴘʀᴇᴜᴠᴇ [@user or reply to a message]',
    execute: async (sock, msg, args, extra) => {
      try {
        const ctx = msg.message?.extendedTextMessage?.contextInfo || {};
        const mentioned = ctx.mentionedJid || [];
        let targetId = null;

        // Détection de la cible : mention ou réponse
        if (mentioned.length > 0) {
          targetId = mentioned[0];
        } else if (ctx.participant) {
          targetId = ctx.participant;
        } else {
          // Si personne n'est ciblé, on prend l'auteur du message
          targetId = msg.key.participant || msg.key.remoteJid;
        }

        const targetTag = `@${targetId.split('@')[0]}`;

        const dares = [
          `*${targetTag} ᴇɴᴠᴏɪᴇ ᴜɴᴇ ᴄᴀᴘᴛᴜʀᴇ ᴅ'ᴇ́ᴄʀᴀɴ ᴅᴇ ᴛᴀ ɢᴀʟᴇʀɪᴇ sᴇᴄʀᴇ̀ᴛᴇ !* 📸`,
          `*${targetTag} ʟᴀɪssᴇ ᴜɴ ᴀʟʟɪᴇ́ ᴇ́ᴄʀɪʀᴇ ᴛᴏɴ sᴛᴀᴛᴜs ᴡʜᴀᴛsᴀᴘᴘ !* ✍🏾`,
          `*${targetTag} ᴀᴘᴘᴇʟʟᴇ ᴜɴ ᴄᴏɴᴛᴀᴄᴛ ᴀᴜ ʜᴀsᴀʀᴅ ᴇᴛ ᴄʜᴀɴᴛᴇ-ʟᴜɪ ᴜɴᴇ ɪɴᴄᴀɴᴛᴀᴛɪᴏɴ !* 📞`,
          `*${targetTag} ᴘᴜʙʟɪᴇ ᴜɴ sᴇʟғɪᴇ ɢᴇ̂ɴᴀɴᴛ ᴅᴀɴs ʟᴇ sᴀɴᴄᴛᴜᴀɪʀᴇ !* 🎭`,
          `*${targetTag} ᴇ́ᴄʀɪs ᴀ̀ ᴛᴏɴ ᴄʀᴜsʜ ᴇᴛ ᴄᴏɴғᴇssᴇ ᴛᴇs sᴇɴᴛɪᴍᴇɴᴛs !* 💌`,
          `*${targetTag} ғᴀɪs 20 ᴘᴏᴍᴘᴇs ᴇᴛ ᴇɴᴠᴏɪᴇ ʟᴀ ᴘʀᴇᴜᴠᴇ ᴇɴ ᴠɪᴅᴇ́ᴏ !* 💪`,
          `*${targetTag} ᴄʜᴀɴɢᴇ ᴛᴀ ᴘʜᴏᴛᴏ ᴅᴇ ᴘʀᴏғɪʟ ᴘᴏᴜʀ ᴜɴᴇ ɪᴍᴀɢᴇ ʀɪᴅɪᴄᴜʟᴇ ᴘᴇɴᴅᴀɴᴛ 24 ʜᴇᴜʀᴇs !* 🖼️`,
          `*${targetTag} ᴇɴᴠᴏɪᴇ ᴜɴᴇ ɴᴏᴛᴇ ᴠᴏᴄᴀʟᴇ ᴏᴜ̀ ᴛᴜ ᴄʜᴀɴᴛᴇs ʟ'ᴀʟᴘʜᴀʙᴇᴛ !* 🎶`,
          `*${targetTag} ʟᴀɪssᴇ ʟᴇ ɢʀᴏᴜᴘᴇ ᴄʜᴏɪsɪʀ ᴛᴏɴ sᴛᴀᴛᴜs ᴘᴏᴜʀ ʟᴀ ᴊᴏᴜʀɴᴇ́ᴇ !* 📜`,
          `*${targetTag} ʀᴀᴄᴏɴᴛᴇ ᴀᴜ ɢʀᴏᴜᴘᴇ ᴛᴏɴ ᴍᴏᴍᴇɴᴛ ʟᴇ ᴘʟᴜs ᴇᴍʙᴀʀʀᴀssᴀɴᴛ !* 😳`,
          `*${targetTag} ᴘᴀʀᴛᴀɢᴇ ʟᴇs 5 ᴅᴇʀɴɪᴇ̀ʀᴇs ʀᴇᴄʜᴇʀᴄʜᴇs ᴅᴇ ᴛᴏɴ ᴏʀᴀᴄʟᴇ ɢᴏᴏɢʟᴇ !* 🔍`,
          `*${targetTag} ᴅᴀɴsᴇ ᴅᴇᴠᴀɴᴛ ᴛᴏᴜᴛ ʟᴇ ᴍᴏɴᴅᴇ ᴘᴇɴᴅᴀɴᴛ 1 ᴍɪɴᴜᴛᴇ !* 💃`,
          `*${targetTag} ɪᴍɪᴛᴇ ᴜɴ ᴍᴇᴍʙʀᴇ ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ ᴅᴇ ᴛᴏɴ ᴍɪᴇᴜx !* 🗣️`,
          `*${targetTag} ᴘᴀʀʟᴇ ᴀᴠᴇᴄ ᴜɴ ᴀᴄᴄᴇɴᴛ ᴇ́ᴛʀᴀɴɢᴇ ᴘᴇɴᴅᴀɴᴛ ʟᴇs 10 ᴘʀᴏᴄʜᴀɪɴᴇs ᴍɪɴᴜᴛᴇs !* 🌍`,
          `*${targetTag} ᴘᴜʙʟɪᴇ ᴜɴᴇ sᴛᴏʀʏ ᴅɪsᴀɴᴛ 'ᴊ'ᴀɪ ᴘᴇʀᴅᴜ ᴜɴ ᴘᴀʀɪ' ᴘᴇɴᴅᴀɴᴛ 24 ʜᴇᴜʀᴇs !* 🃏`,
          `*${targetTag} ʟᴀɪssᴇ ᴜɴᴇ ᴘᴇʀsᴏɴɴᴇ ғᴏᴜɪʟʟᴇʀ ᴛᴏɴ ᴛᴇ́ʟᴇ́ᴘʜᴏɴᴇ ᴘᴇɴᴅᴀɴᴛ 2 ᴍɪɴᴜᴛᴇs !* 📱`,
          `*${targetTag} ᴇɴᴠᴏɪᴇ ᴜɴ ᴍᴇssᴀɢᴇ ᴅᴇ sᴇ́ᴅᴜᴄᴛɪᴏɴ ᴀ̀ ᴜɴ ᴄᴏɴᴛᴀᴄᴛ ᴀᴜ ʜᴀsᴀʀᴅ !* 😏`,
          `*${targetTag} ᴇxᴇ́ᴄᴜᴛᴇ 50 ᴊᴜᴍᴘɪɴɢ ᴊᴀᴄᴋs !* 🤸`,
          `*${targetTag} ʀᴀᴄᴏɴᴛᴇ ᴜɴᴇ ʙʟᴀɢᴜᴇ. sɪ ᴘᴇʀsᴏɴɴᴇ ɴᴇ ʀɪᴛ, ᴛᴜ ᴅᴏɪs sᴜʙɪʀ ᴜɴ ᴀᴜᴛʀᴇ ᴅᴇ́ғɪ !* 🃏`,
          `*${targetTag} ᴇɴʀᴇɢɪsᴛʀᴇ-ᴛᴏɪ ᴇɴ ᴛʀᴀɪɴ ᴅᴇ ғᴀɪʀᴇ ᴜɴᴇ ᴅᴀɴsᴇ ᴛɪᴋᴛᴏᴋ !* 🎬`
        ];
        
        const randomDare = dares[Math.floor(Math.random() * dares.length)];
        
        await sock.sendMessage(msg.key.remoteJid, {
          text: randomDare,
          mentions: [targetId]
        }, { quoted: msg });
        
      } catch (error) {
        console.error('Dare Error:', error);
        await sock.sendMessage(msg.key.remoteJid, {
          text: `❌ Error: ${error.message}`
        }, { quoted: msg });
      }
    }
};
