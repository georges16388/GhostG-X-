/**
 * Courage Command - Send a random Christian motivation message
 * Version : Prestige V5.2 - Full Power (Design Small Caps)
 * Category : ♰ sᴀɪɴᴛᴇᴛᴇ́ ᴄᴇ́ʟᴇsᴛᴇ
 * Powered by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const config = require('../../config');

// Extraction du préfixe pour l'usage
const prefix = config.prefix || '.';

module.exports = {
  name: 'courage',
  aliases: ['espoir', 'foi', 'grace', 'fortifier', 'force', 'f'],
  category: '♰ sᴀɪɴᴛᴇᴛᴇ́ ᴄᴇ́ʟᴇsᴛᴇ',
  description: '**ʀᴇᴄ̧ᴏɪs ᴜɴ ᴍᴇssᴀɢᴇ ᴅᴇ ᴍᴏᴛɪᴠᴀᴛɪᴏɴ ᴄʜʀᴇ́ᴛɪᴇɴɴᴇ ᴘᴏᴜʀ ғᴏʀᴛɪғɪᴇʀ ᴛᴏɴ ᴀ̂ᴍᴇ**',
  usage: `${prefix}courage [@user ou réponds à un message]`,

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
        `*${targetTag} ǫᴜᴇ ʟᴇ ᴅɪᴇᴜ ᴅᴇ ʟ'ᴇsᴘᴇ́ʀᴀɴᴄᴇ ᴛᴇ ʀᴇᴍᴘʟɪssᴇ ᴅᴇ ᴛᴏᴜᴛᴇ ᴊᴏɪᴇ ᴇᴛ ᴅᴇ ᴛᴏᴜᴛᴇ ᴘᴀɪx ᴅᴀɴs ʟᴀ ғᴏɪ !* 🌟❤️`,
        // 🔥 AJOUT DE 10 NOUVEAUX MESSAGES CÉLESTES :
        `*${targetTag} ɴᴇ ᴛᴇ ʟᴀssᴇ ᴘᴀs ᴅᴇ ғᴀɪʀᴇ ʟᴇ ʙɪᴇɴ, ᴄᴀʀ ᴛᴜ ᴍᴏɪssᴏɴɴᴇʀᴀs ᴀᴜ ᴛᴇᴍᴘs ᴄᴏɴᴠᴇɴᴀʙʟᴇ sɪ ᴛᴜ ɴᴇ ᴛᴇ ʀᴇʟᴀ̂ᴄʜᴇs ᴘᴀs.* 🌱`,
        `*${targetTag} sɪ ᴅɪᴇᴜ ᴇsᴛ ᴘᴏᴜʀ ᴛᴏɪ, ǫᴜɪ sᴇʀᴀ ᴄᴏɴᴛʀᴇ ᴛᴏɪ ? sᴏɪs sᴀɴs ᴄʀᴀɪɴᴛᴇ ᴇᴛ ᴍᴀʀᴄʜᴇ ʟᴀ ᴛᴇ̂ᴛᴇ ʜᴀᴜᴛᴇ.* 👑`,
        `*${targetTag} ɪʟ ɢᴜᴇ́ʀɪᴛ ᴄᴇᴜx ǫᴜɪ ᴏɴᴛ ʟᴇ ᴄᴏᴇᴜʀ ʙʀɪsᴇ́ ᴇᴛ ɪʟ ᴘᴀɴsᴇ ʟᴇᴜʀs ʙʟᴇssᴜʀᴇs. ʟᴀɪssᴇ sᴏɴ ᴀᴍᴏᴜʀ ᴛᴇ ʀᴇsᴛᴀᴜʀᴇʀ.* 🩹✨`,
        `*${targetTag} ʀᴇᴍᴇᴛs ᴛᴏɴ sᴏʀᴛ ᴀ̀ ʟ'ᴇ́ᴛᴇʀɴᴇʟ, ᴍᴇᴛs ᴇɴ ʟᴜɪ ᴛᴀ ᴄᴏɴғɪᴀɴᴄᴇ, ᴇᴛ ɪʟ ᴀɢɪʀᴀ. sᴏɴ ᴛᴇᴍᴘs ᴇsᴛ ʟᴇ ᴍᴇɪʟʟᴇᴜʀ.* ⏳`,
        `*${targetTag} ǫᴜᴇ ʟᴀ ᴘᴀɪx ᴅᴜ ᴄʜʀɪsᴛ, ᴀ̀ ʟᴀǫᴜᴇʟʟᴇ ᴛᴜ ᴀs ᴇ́ᴛᴇ́ ᴀᴘᴘᴇʟᴇ́, ʀᴇ̀ɢɴᴇ ᴅᴀɴs ᴛᴏɴ ᴄᴏᴇᴜʀ ᴇɴ ᴄᴇ ᴊᴏᴜʀ.* 🕊️📜`,
        `*${targetTag} ʟᴇ sᴇɪɢɴᴇᴜʀ ᴇsᴛ ᴛᴏɴ ʀᴏᴄʜᴇʀ, ᴛᴀ ғᴏʀᴛᴇʀᴇssᴇ ᴇᴛ ᴛᴏɴ ʟɪʙᴇ́ʀᴀᴛᴇᴜʀ. ᴀʙʀɪᴛᴇ-ᴛᴏɪ sᴏᴜs sᴏɴ ᴀɪʟᴇ.* 🏰`,
        `*${targetTag} ɴᴇ ᴛ'ᴇɴ ғᴀɪs ᴘᴀs ᴘᴏᴜʀ ʟᴇ ʟᴇɴᴅᴇᴍᴀɪɴ, ᴄᴀʀ ᴄʜᴀǫᴜᴇ ᴊᴏᴜʀ sᴜғғɪᴛ sᴀ ᴘᴇɪɴᴇ. ᴄᴏɴғɪᴇ-ᴛᴏɪ ᴇɴ sᴀ ʙɪᴇɴᴠᴇɪʟʟᴀɴᴄᴇ.* 🌅`,
        `*${targetTag} ᴛᴇs ᴘᴇɴsᴇ́ᴇs sᴏɴᴛ ᴄᴏɴɴᴜᴇs ᴅᴇ ʟᴜɪ, ɪʟ ɴ'ᴀʙᴀɴᴅᴏɴɴᴇ ᴊᴀᴍᴀɪs sᴇs ᴇɴғᴀɴᴛs. ᴛᴜ ᴇs ᴘʀᴇ́ᴄɪᴇᴜx ᴀ̀ sᴇs ʏᴇᴜx.* 💎`,
        `*${targetTag} sᴀ sᴀɢᴇssᴇ sᴜʀᴘᴀssᴇ ᴛᴏᴜᴛᴇ sᴀɢᴇssᴇ ʜᴜᴍᴀɪɴᴇ. sᴜɪs sᴀ ʟᴜᴍɪᴇ̀ʀᴇ ᴇᴛ ᴛᴜ ɴᴇ ᴛᴇ ᴘᴇʀᴅʀᴀs ᴘᴀs.* 🕯️📖`,
        `*${targetTag} ʀᴇ́ᴊᴏᴜɪs-ᴛᴏɪ ᴛᴏᴜᴊᴏᴜʀs ᴅᴀɴs ʟᴇ sᴇɪɢɴᴇᴜʀ ; ᴊᴇ ʟᴇ ʀᴇ́ᴘᴇ̀ᴛᴇ, ʀᴇ́ᴊᴏᴜɪs-ᴛᴏɪ ! ʟᴀ ᴊᴏɪᴇ ᴇsᴛ ᴛᴀ ғᴏʀᴄᴇ.* 🎉❤️`
      ];

      const randomMessage = messages[Math.floor(Math.random() * messages.length)];

      // Envoi du message dans le Sanctuaire avec la signature
      await sock.sendMessage(msg.key.remoteJid, {
        text: `${randomMessage}\n\n` +
              `*_❤️ ᴊᴇsᴜs ᴛ'ᴀɪᴍᴇ ᴇᴛ ᴛᴇ ʙᴇ́ɴɪssᴇ ❤️_*\n` +
              `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`,
        mentions: [targetId]
      }, { quoted: msg });

    } catch (error) {
      console.error('Courage Command Error:', error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: `*〆 ᴇ́ᴄʜᴇᴄ ᴅ'ɪɴᴠᴏᴄᴀᴛɪᴏɴ :* ${error.message}`
      }, { quoted: msg });
    }
  }
};
