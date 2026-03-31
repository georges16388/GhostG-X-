/**
 * Courage Command - Send a random Christian motivation message
 * Version : Prestige V5.2 - Full Power (Design Small Caps)
 * Category : ♰ sᴀɪɴᴛᴇᴛᴇ́ ᴄᴇ́ʟᴇsᴛᴇ
 * Powered by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

module.exports = {
  name: 'courage',
  aliases: ['espoir', 'foi', 'grace', 'fortifier', 'force', 'f'],
  category: '♰ sᴀɪɴᴛᴇᴛᴇ́ ᴄᴇ́ʟᴇsᴛᴇ',
  description: 'Reçois un message de motivation chrétienne pour fortifier ton âme.',
  usage: '.courage [@user ou réponds à un message]',
  
  async execute(sock, msg, args, extra) {
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

      // Grimoire de motivations chrétiennes au style GhostG-X
      const messages = [
        `*${targetTag} ɴᴇ ᴄʀᴀɪɴs ʀɪᴇɴ, ᴄᴀʀ ʟᴇ sᴇɪɢɴᴇᴜʀ ᴇsᴛ ᴀᴠᴇᴄ ᴛᴏɪ. ᴛᴀ ғᴏʀᴄᴇ ᴇsᴛ ʀᴇɴᴏᴜᴠᴇʟᴇ́ᴇ ᴄᴏᴍᴍᴇ ᴄᴇʟʟᴇ ᴅᴇ ʟ'ᴀɪɢʟᴇ !* 🦅✨`,
        `*${targetTag} ᴍᴇ̂ᴍᴇ ᴅᴀɴs ʟᴀ ᴠᴀʟʟᴇ́ᴇ ᴅᴇ ʟ'ᴏᴍʙʀᴇ ᴇᴛ ᴅᴇ ʟᴀ ᴍᴏʀᴛ, ɴᴇ ʀᴇᴅᴏᴜᴛᴇ ᴀᴜᴄᴜɴ ᴍᴀʟ. sᴀ ʜᴏᴜʟᴇᴛᴛᴇ ᴛᴇ ʀᴀssᴜʀᴇ.* 🛡️`,
        `*${targetTag} ᴛᴏᴜᴛ ᴇsᴛ ᴘᴏssɪʙʟᴇ ᴀ̀ ᴄᴇʟᴜɪ ǫᴜɪ ᴄʀᴏɪᴛ. ᴛᴇs ᴍᴏɴᴛᴀɢɴᴇs ᴅᴇ sᴏᴜᴄɪs sᴇ ᴅᴇ́ᴘʟᴀᴄᴇʀᴏɴᴛ !* ⛰️🙏`,
        `*${targetTag} sᴏɪs ғᴏʀᴛ ᴇᴛ ᴘʀᴇɴᴅs ᴄᴏᴜʀᴀɢᴇ ! ɴᴇ sᴏɪs ᴘᴀs ᴇғғʀᴀʏᴇ́, ᴄᴀʀ ʟ'ᴇ́ᴛᴇʀɴᴇʟ ᴛᴇ sᴏᴜᴛɪᴇɴᴛ.* 💪🏾📖`,
        `*${targetTag} sᴀ ɢʀᴀ̂ᴄᴇ ᴛᴇ sᴜғғɪᴛ, ᴄᴀʀ sᴀ ᴘᴜɪssᴀɴᴄᴇ s'ᴀᴄᴄᴏᴍᴘʟɪᴛ ᴅᴀɴs ᴛᴀ ғᴀɪʙʟᴇssᴇ. ʀᴇʟᴇ̀ᴠᴇ-ᴛᴏɪ !* 🌅`,
        `*${targetTag} ɴᴇ ᴛ'ɪɴǫᴜɪᴇ̀ᴛᴇ ᴅᴇ ʀɪᴇɴ, ᴍᴀɪs ᴇɴ ᴛᴏᴜᴛᴇ ᴄʜᴏsᴇ ғᴀɪs ᴄᴏɴɴᴀɪ̂ᴛʀᴇ ᴛᴇs ʙᴇsᴏɪɴs ᴀ̀ ᴅɪᴇᴜ ᴘᴀʀ ʟᴀ ᴘʀɪᴇ̀ʀᴇ.* 🤲🏾`,
        `*${targetTag} ᴛᴜ ᴇs ᴘʟᴜs ǫᴜᴇ ᴠᴀɪɴǫᴜᴇᴜʀ ᴘᴀʀ ᴄᴇʟᴜɪ ǫᴜɪ ᴛ'ᴀ ᴀɪᴍᴇ́. ᴀᴜᴄᴜɴᴇ ᴀʀᴍᴇ ғᴏʀɢᴇ́ᴇ ᴄᴏɴᴛʀᴇ ᴛᴏɪ ɴ'ᴀᴜʀᴀ ᴅ'ᴇғғᴇᴛ.* ⚔️`,
        `*${targetTag} ʟᴇs ᴘʟᴇᴜʀs ᴘᴇᴜᴠᴇɴᴛ ᴅᴜʀᴇʀ ʟᴀ ɴᴜɪᴛ, ᴍᴀɪs ᴀᴜ ᴍᴀᴛɪɴ ᴇ́ᴄʟᴀᴛᴇ ʟᴀ ᴊᴏɪᴇ. ᴛɪᴇɴs ʙᴏɴ !* ☀️🌈`,
        `*${targetTag} ɪʟ ᴀ ᴘᴏᴜʀ ᴛᴏɪ ᴅᴇs ᴘʀᴏᴊᴇᴛs ᴅᴇ ᴘᴀɪx ᴇᴛ ɴᴏɴ ᴅᴇ ᴍᴀʟʜᴇᴜʀ, ᴀғɪɴ ᴅᴇ ᴛᴇ ᴅᴏɴɴᴇʀ ᴜɴ ᴀᴠᴇɴɪʀ ᴇᴛ ᴅᴇ ʟ'ᴇsᴘᴇ́ʀᴀɴᴄᴇ.* 📜`,
        `*${targetTag} ʟᴀ ғᴏɪ ᴇsᴛ ᴜɴᴇ ғᴇʀᴍᴇ ᴀssᴜʀᴀɴᴄᴇ ᴅᴇs ᴄʜᴏsᴇs ǫᴜ'ᴏɴ ᴇsᴘᴇ̀ʀᴇ. ɢᴀʀᴅᴇ ʟᴇ ᴄᴀᴘ, ɢᴜᴇʀʀɪᴇʀ.* ⚓`,
        `*${targetTag} ᴄᴇʟᴜɪ ǫᴜɪ ᴇsᴛ ᴇɴ ᴛᴏɪ ᴇsᴛ ᴘʟᴜs ɢʀᴀɴᴅ ǫᴜᴇ ᴄᴇʟᴜɪ ǫᴜɪ ᴇsᴛ ᴅᴀɴs ʟᴇ ᴍᴏɴᴅᴇ. sᴏɪs ᴇɴ ᴘᴀɪx.* 🌌`,
        `*${targetTag} ǫᴜᴀɴᴅ ᴛᴜ ᴍᴀʀᴄʜᴇʀᴀs ᴅᴀɴs ʟᴇ ғᴇᴜ, ɪʟ ɴᴇ ᴛᴇ ʙʀᴜ̂ʟᴇʀᴀ ᴘᴀs. sᴀ ᴘʀᴇ́sᴇɴᴄᴇ ᴛᴇ sᴇ́ᴄᴜʀɪsᴇ.* 🔥🛡️`,
        `*${targetTag} ᴄᴇᴜx ǫᴜɪ sᴇ ᴄᴏɴғɪᴇɴᴛ ᴇɴ ʟ'ᴇ́ᴛᴇʀɴᴇʟ sᴏɴᴛ ᴄᴏᴍᴍᴇ ʟᴀ ᴍᴏɴᴛᴀɢɴᴇ ᴅᴇ sɪᴏɴ : ɪʟs ɴᴇ sᴏɴᴛ ᴘᴏɪɴᴛ ᴇ́ʙʀᴀɴʟᴇ́s.* 🏔️`,
        `*${targetTag} ǫᴜᴇ ᴛᴏɴ ᴄᴏᴇᴜʀ ɴᴇ sᴇ ᴛʀᴏᴜʙʟᴇ ᴘᴏɪɴᴛ. ᴀɪᴇ ғᴏɪ ᴇɴ ᴅɪᴇᴜ, ɪʟ ᴀ ᴅᴇ́ᴊᴀ̀ ᴀᴘᴘʟᴀɴɪ ʟᴇ sᴇɴᴛɪᴇʀ.* 🗺️`,
        `*${targetTag} ʟ'ᴇ́ᴛᴇʀɴᴇʟ ᴄᴏᴍʙᴀᴛᴛʀᴀ ᴘᴏᴜʀ ᴛᴏɪ ; ᴇᴛ ᴛᴏɪ, ɢᴀʀᴅᴇ ʟᴇ sɪʟᴇɴᴄᴇ. ʟᴀ ᴠɪᴄᴛᴏɪʀᴇ ᴇsᴛ ᴘʀᴏᴄʜᴇ.* ⚔️🛡️`,
        `*${targetTag} ᴛᴜ ᴘᴇᴜx ᴛᴏᴜᴛ ᴘᴀʀ ᴄᴇʟᴜɪ ǫᴜɪ ᴛᴇ ғᴏʀᴛɪғɪᴇ. ɴᴇ ʟᴀɪssᴇ ᴘᴀs ʟᴇ ᴅᴏᴜᴛᴇ ᴇ́ᴛᴇɪɴᴅʀᴇ ᴛᴀ ʟᴜᴍɪᴇ̀ʀᴇ.* 💡`,
        `*${targetTag} sᴏɪs sᴀɴs ᴄʀᴀɪɴᴛᴇ, ᴄᴀʀ ɪʟ ᴛᴇ ᴛɪᴇɴᴛ ᴘᴀʀ ʟᴀ ᴍᴀɪɴ ᴅʀᴏɪᴛᴇ ᴇᴛ ᴛᴇ ᴅɪᴛ : ɴᴇ ᴄʀᴀɪɴs ʀɪᴇɴ, ᴊᴇ ᴠɪᴇɴs ᴀ̀ ᴛᴏɴ sᴇᴄᴏᴜʀs.* 🤝`,
        `*${targetTag} ʟᴀ ᴘᴀɪx ǫᴜ'ɪʟ ᴛᴇ ᴅᴏɴɴᴇ sᴜʀᴘᴀssᴇ ᴛᴏᴜᴛᴇ ɪɴᴛᴇʟʟɪɢᴇɴᴄᴇ. ǫᴜ'ᴇʟʟᴇ ɢᴀʀᴅᴇ ᴛᴏɴ ᴄᴏᴇᴜʀ ᴇᴛ ᴛᴇs ᴘᴇɴsᴇ́ᴇs.* 🕊️`,
        `*${targetTag} ʟ'ᴇ́ᴛᴇʀɴᴇʟ ᴇsᴛ ᴍᴏɴ ʙᴇʀɢᴇʀ : ᴊᴇ ɴᴇ ᴍᴀɴǫᴜᴇʀᴀɪ ᴅᴇ ʀɪᴇɴ. ɪʟ ᴛᴇ ғᴀɪᴛ ʀᴇᴘᴏsᴇʀ ᴅᴀɴs ᴅᴇ ᴠᴇʀᴛs ᴘᴀ̂ᴛᴜʀᴀɢᴇs.* 🌿`,
        `*${targetTag} ǫᴜᴇ ʟᴇ ᴅɪᴇᴜ ᴅᴇ ʟ'ᴇsᴘᴇ́ʀᴀɴᴄᴇ ᴛᴇ ʀᴇᴍᴘʟɪssᴇ ᴅᴇ ᴛᴏᴜᴛᴇ ᴊᴏɪᴇ ᴇᴛ ᴅᴇ ᴛᴏᴜᴛᴇ ᴘᴀɪx ᴅᴀɴs ʟᴀ ғᴏɪ !* 🌟❤️`
      ];

      const randomMessage = messages[Math.floor(Math.random() * messages.length)];

      // Envoi du message dans le Sanctuaire avec la signature
      await sock.sendMessage(msg.key.remoteJid, {
        text: `${randomMessage}\n\n` +
              `*_❤️ ᴊᴇsᴜs ᴛᴀɪᴍᴇ ᴇᴛ ᴛᴇ ʙᴇ́ɴɪssᴇ_❤️*\n` +
              `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`,
        mentions: [targetId]
      }, { quoted: msg });

    } catch (error) {
      console.error('Courage Command Error:', error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ *ᴇʀʀᴇᴜʀ :* ${error.message}`
      }, { quoted: msg });
    }
  }
};
