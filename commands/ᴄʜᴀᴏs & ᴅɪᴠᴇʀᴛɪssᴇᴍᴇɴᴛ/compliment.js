/**
 * Compliment - Send a random compliment
 */

module.exports = {
    name: 'ʟᴏᴜᴀɴɢᴇ',
    aliases: ['praise', 'compliment', 'louange'],
    category: '♞  ᴄʜᴀᴏs & ᴅɪᴠᴇʀᴛɪssᴇᴍᴇɴᴛ',
    desc: 'Get a random compliment',
    usage: 'ʟᴏᴜᴀɴɢᴇ [@user or reply to a message]',
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

        const compliments = [
          `*${targetTag} ᴛᴜ ᴇs ᴜɴ ᴀʟʟɪᴇ́ ᴅ'ᴇxᴄᴇᴘᴛɪᴏɴ ᴅᴀɴs ᴄᴇ sᴀɴᴄᴛᴜᴀɪʀᴇ !* 💙`,
          `*${targetTag} ᴛᴀ ᴘʀᴇ́sᴇɴᴄᴇ ɪʟʟᴜᴍɪɴᴇ ʟᴇs ᴀʀᴄᴀɴᴇs ᴅᴇ ʟ'ᴏᴍʙʀᴇ !* ✨`,
          `*${targetTag} ᴛᴜ ᴇs ʟ'ᴇᴍʙʟᴇ̀ᴍᴇ ᴅ'ᴜɴ sᴏᴜʀɪʀᴇ ᴠɪᴠᴀɴᴛ !* 😊`,
          `*${targetTag} ᴛᴀ ᴠᴀʟᴇᴜʀ sᴜʀᴘᴀssᴇ ᴄᴇʟʟᴇ ᴅᴇs ᴄʀᴇ́ᴀᴛᴜʀᴇs ʟᴇ́ɢᴇɴᴅᴀɪʀᴇs !* 🦄`,
          `*${targetTag} ᴛᴜ ᴇs ᴜɴ ʙɪᴇɴғᴀɪᴛ ᴘᴏᴜʀ ᴄᴇᴜx ǫᴜɪ ᴛ'ᴇɴᴛᴏᴜʀᴇɴᴛ !* 🎁`,
          `*${targetTag} ᴛᴏɴ ᴇsᴘʀɪᴛ ᴇsᴛ ᴀᴜssɪ ᴠɪғ ǫᴜ'ᴜɴᴇ ʟᴀᴍᴇ sᴀᴄʀᴇ́ᴇ !* 🍪`,
          `*${targetTag} ᴛᴀ ɢʀᴀɴᴅᴇᴜʀ ᴇsᴛ ɪɴᴄᴏɴᴛᴇsᴛᴀʙʟᴇ !* 🌟`,
          `*${targetTag} ᴛᴏɴ ʀɪʀᴇ ᴇsᴛ ʟ'ᴇ́ᴄʜᴏ ʟᴇ ᴘʟᴜs ʜᴀʀᴍᴏɴɪᴇᴜx !* 😄`,
          `*${targetTag} ᴛᴀ sᴘʟᴇɴᴅᴇᴜʀ ᴇsᴛ ᴀ̀ ᴄᴏᴜᴘᴇʀ ʟᴇ sᴏᴜғғʟᴇ !* 💖`,
          `*${targetTag} ᴛᴀ ʙɪᴇɴᴠᴇɪʟʟᴀɴᴄᴇ ᴇsᴛ ᴜɴ ᴘɪʟɪᴇʀ ᴘᴏᴜʀ ɴᴏᴜs ᴛᴏᴜs !* 🤝`,
          `*${targetTag} ᴛᴏɴ sᴇɴs ᴅᴇ ʟ'ʜᴜᴍᴏᴜʀ ᴇsᴛ ᴜɴ ᴠᴇ́ʀɪᴛᴀʙʟᴇ ᴛʀᴇ́sᴏʀ !* 😂`,
          `*${targetTag} ᴛᴜ ᴇs ᴜɴᴇ ᴇ̂ᴛʀᴇ ᴅ'ᴜɴᴇ ʀᴀʀᴇᴛᴇ́ ᴇxᴄᴇᴘᴛɪᴏɴɴᴇʟʟᴇ !* ⭐`,
          `*${targetTag} ᴛᴏɴ ᴀᴍɪᴛɪᴇ́ ᴇsᴛ ᴜɴ sᴄᴇᴀᴜ ɪɴᴠɪᴏʟᴀʙʟᴇ !* 🫂`,
          `*${targetTag} ᴛᴀ ᴘᴇʀsᴘᴇᴄᴛɪᴠᴇ ᴇsᴛ ᴜɴ sᴏᴜғғʟᴇ ᴅᴇ ᴠɪᴇ ʀᴇғʀᴀɪ̂ᴄʜɪssᴀɴᴛ !* 🌈`,
          `*${targetTag} ᴛᴜ ᴀᴄᴄᴏᴍᴘʟɪs ᴅᴇs ᴘɪᴇᴅs ᴅ'ᴀʟᴄʜɪᴍɪᴇ ᴄʜᴀǫᴜᴇ ᴊᴏᴜʀ !* 🌍`,
          `*${targetTag} ᴛᴀ ғᴏʀᴄᴇ ɪɴᴛᴇ́ʀɪᴇᴜʀᴇ ᴇsᴛ ᴜɴᴇ ғᴏʀɢᴇ ɪɴᴛᴇʀᴘʟᴀɴᴇ́ᴛᴀɪʀᴇ !* 💪🏾`,
          `*${targetTag} ᴛᴏɴ sᴏᴜʀɪʀᴇ ᴇsᴛ ᴜɴᴇ ɪɴᴠᴏᴄᴀᴛɪᴏɴ ᴀ̀ ʟᴀ ᴊᴏɪᴇ !* 😁`,
          `*${targetTag} ᴛᴜ ᴇs ᴜɴ ᴊᴏʏᴀᴜ ᴜɴɪǫᴜᴇ ᴅᴀɴs ʟ'ᴇ́ᴄʀɪɴ ᴅᴇ ʟ'ᴜɴɪᴠᴇʀs !* 💎`,
          `*${targetTag} ᴛᴜ ᴇ́ᴠᴇɪʟʟᴇs ʟᴇ ᴍᴇɪʟʟᴇᴜʀ ᴇɴ ᴄʜᴀǫᴜᴇ ᴀ̂ᴍᴇ !* 👏🏾`,
          `*${targetTag} ᴛᴜ ᴇs ᴜɴᴇ sᴏᴜʀᴄᴇ ᴅ'ɪɴsᴘɪʀᴀᴛɪᴏɴ ᴇ́ᴛᴇʀɴᴇʟʟᴇ !* 🌟`
        ];
        
        const randomCompliment = compliments[Math.floor(Math.random() * compliments.length)];
        
        await sock.sendMessage(msg.key.remoteJid, {
          text: randomCompliment,
          mentions: [targetId]
        }, { quoted: msg });
        
      } catch (error) {
        console.error('Compliment Error:', error);
        await sock.sendMessage(msg.key.remoteJid, {
          text: `❌ Error: ${error.message}`
        }, { quoted: msg });
      }
    }
  };
  