/**
 * Flirt - Get a random flirty message
 */

module.exports = {
    name: 'ᴄʜᴀʀᴍᴇ',
    aliases: ['pickup', 'pickupline', 'flirt', 'charme', 'drague'],
    category: '♞  ᴄʜᴀᴏs & ᴅɪᴠᴇʀᴛɪssᴇᴍᴇɴᴛ',
    desc: 'Get a random flirty pickup line',
    usage: 'ᴄʜᴀʀᴍᴇ [@user or reply to a message]',
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

        const flirts = [
          `*${targetTag} ᴇsᴛ-ᴄᴇ ǫᴜᴇ ᴛᴜ ᴀs ᴜɴ ᴘʟᴀɴ ? ᴘᴀʀᴄᴇ ǫᴜᴇ ᴊᴇ ᴠɪᴇɴs ᴅᴇ ᴍᴇ ᴘᴇʀᴅʀᴇ ᴅᴀɴs ᴛᴇs ʏᴇᴜx.* 😍`,
          `*${targetTag} sɪ ᴛᴏɪ ᴇᴛ ᴍᴏɪ ᴏɴ ᴇ́ᴛᴀɪᴛ ᴅᴇs ᴠᴏʟᴇᴜʀs, ᴊᴇ ᴛᴇ ʟᴀɪssᴇʀᴀɪs ᴘɪʟʟᴇʀ ᴍᴏɴ ᴄᴏᴇᴜʀ.* 💘`,
          `*${targetTag} ᴊ'ᴇsᴘᴇ̀ʀᴇ ǫᴜᴇ ᴛᴜ ᴀs ᴜɴᴇ ʙᴏɴɴᴇ ᴀssᴜʀᴀɴᴄᴇ, ᴘᴀʀᴄᴇ ǫᴜᴇ ᴛᴏɴ ᴄʜᴀʀᴍᴇ ᴍ'ᴀ ғᴀɪᴛ ᴛᴏᴍʙᴇʀ.* 🚑`,
          `*${targetTag} ᴛᴜ ɴ'ᴇs ᴘᴀs ᴜɴ sᴏʀᴛɪʟᴇ̀ɢᴇ, ᴍᴀɪs ᴛᴜ ᴍ'ᴀs ᴄᴏᴍᴘʟᴇ̀ᴛᴇᴍᴇɴᴛ ᴇɴᴠᴏᴜ̂ᴛᴇ́.* ✨`,
          `*${targetTag} ᴊᴇ ɴᴇ sᴜɪs ᴘᴀs ᴜɴ ᴘʜᴏᴛᴏɢʀᴀᴘʜᴇ, ᴍᴀɪs ᴊᴇ ᴘᴇᴜx ᴛʀᴇ̀s ʙɪᴇɴ ɴᴏᴜs ɪᴍᴀɢɪɴᴇʀ ᴇɴsᴇᴍʙʟᴇ.* 📸`,
          `*${targetTag} ᴛᴏɴ sᴏᴜʀɪʀᴇ ᴇsᴛ ᴘʟᴜs ᴘᴜɪssᴀɴᴛ ǫᴜᴇ ɴ'ɪᴍᴘᴏʀᴛᴇ ǫᴜᴇʟ ᴀʟɢᴏʀɪᴛʜᴍᴇ.* 😏`,
          `*${targetTag} ᴛᴜ ᴅᴏɪs ᴇ̂ᴛʀᴇ ᴇ́ᴘᴜɪsᴇ́(ᴇ)... ᴛᴜ ᴀs ᴍᴀʀᴄʜᴇ́ ᴅᴀɴs ᴍᴇs ᴘᴇɴsᴇ́ᴇs ᴛᴏᴜᴛᴇ ʟᴀ ᴊᴏᴜʀɴᴇ́ᴇ.* 💭`,
          `*${targetTag} sɪ ᴇ̂ᴛʀᴇ sᴜʙʟɪᴍᴇ ᴇ́ᴛᴀɪᴛ ᴜɴ ᴄʀɪᴍᴇ, ᴛᴜ sᴇʀᴀɪs ᴇɴ ᴘʀɪsᴏɴ ᴀ̀ ᴘᴇʀᴘᴇ́ᴛᴜɪᴛᴇ́.* ⚖️`,
          `*${targetTag} ᴍᴏɴ ᴍᴇ́ᴅᴇᴄɪɴ ᴍ'ᴀ ᴅɪᴛ ǫᴜᴇ ᴊ'ᴀᴠᴀɪs ᴜɴ ᴍᴀɴǫᴜᴇ ᴅᴇ ᴠɪᴛᴀᴍɪɴᴇ... ʟᴀ ᴠɪᴛᴀᴍɪɴᴇ TOI.* 💊`,
          `*${targetTag} ᴇsᴛ-ᴄᴇ ǫᴜᴇ ᴛᴜ ᴇs ᴜɴ ᴍᴀɢɪᴄɪᴇɴ ? ᴘᴀʀᴄᴇ ǫᴜᴇ ᴅᴇ̀s ǫᴜᴇ ᴊᴇ ᴛᴇ ᴠᴏɪs, ʟᴇ reste ᴅɪsᴘᴀʀᴀɪ̂ᴛ.* 🎩`,
          `*${targetTag} ᴛᴜ ᴇs ʟᴀ sᴇᴜʟᴇ ᴇʀʀᴇᴜʀ sʏsᴛᴇ̀ᴍᴇ ǫᴜᴇ ᴊᴇ ɴ'ᴀɪ ᴘᴀs ᴇɴᴠɪᴇ ᴅᴇ ᴄᴏʀʀɪɢᴇʀ.* 🤖`,
          `*${targetTag} sɪ ᴊᴇ ᴅᴇᴠᴀɪs ᴇ́ᴄʀɪʀᴇ ᴜɴ sᴄʀɪᴘᴛ ᴘᴏᴜʀ ʟᴇ ʙᴏɴʜᴇᴜʀ, ɪʟ ɴ'ʏ ᴀᴜʀᴀɪᴛ ǫᴜᴇ ᴛᴏɴ ɴᴏᴍ.* 📝`,
          `*${targetTag} ᴛᴜ ᴀs ᴜɴ ᴘᴇᴛɪᴛ ᴘʀᴏʙʟᴇ̀ᴍᴇ ᴀᴜx ʏᴇᴜx... ɪʟs ʙʀɪʟʟᴇɴᴛ ʙᴇᴀᴜᴄᴏᴜᴘ ᴛʀᴏᴘ.* ✨`,
          `*${targetTag} sɪ sᴇᴜʟᴇᴍᴇɴᴛ ᴊᴇ ᴘᴏᴜᴠᴀɪs ᴇ̂ᴛʀᴇ ᴛᴏɴ ᴏᴍʙʀᴇ ᴘᴏᴜʀ ᴛᴇ sᴜɪᴠʀᴇ ᴘᴀʀᴛᴏᴜᴛ.* 👤`,
          `*${targetTag} ᴛᴜ ᴇs ᴄᴏᴍᴍᴇ ʟᴇ ᴍᴇɪʟʟᴇᴜʀ ᴅᴇs ᴄᴀғᴇ́s : ᴛᴜ m'ᴇ̂ᴍᴘᴇᴄʜᴇs ᴅᴇ ᴅᴏʀᴍɪʀ ᴇᴛ ᴛᴜ ᴍ'ᴇxᴄɪᴛᴇs.* ☕`,
          `*${targetTag} ᴊᴇ ɴ'ᴀɪ ᴘʟᴜs ʙᴇsᴏɪɴ ᴅᴇ ɢᴏᴏɢʟᴇ, ᴊ'ᴀɪ ᴛʀᴏᴜᴠᴇ́ ᴛᴏᴜᴛ ᴄᴇ ǫᴜᴇ ᴊᴇ ᴄʜᴇʀᴄʜᴀɪs ᴇɴ ᴛᴏɪ.* 🔍`,
          `*${targetTag} ᴛᴜ ᴇs sɪ ᴍᴀɢɴᴇ́ᴛɪǫᴜᴇ ǫᴜᴇ ᴛᴜ ᴅᴏɪs ᴀᴠᴏɪʀ ᴅᴇs ᴀɪᴍᴀɴᴛs ᴄᴀᴄʜᴇ́s.* 🧲`,
          `*${targetTag} ᴍᴏɴ ᴄᴏᴇᴜʀ ғᴀɪᴛ ᴅᴇs sᴀᴜᴛs sʏᴍᴘʜᴏɴɪǫᴜᴇs ᴅᴇ̀s ǫᴜᴇ ᴛᴜ ᴇs ʟᴀ̀.* 🎵`,
          `*${targetTag} ᴛᴜ ᴅᴏɪs ᴇ̂ᴛʀᴇ ғᴀɪᴛ(ᴇ) ᴅᴇ sᴜᴄʀᴇ ᴘᴏᴜʀ ᴇ̂ᴛʀᴇ ᴀᴜssɪ ᴅᴏᴜx/ᴅᴏᴜᴄᴇ.* 🍭`,
          `*${targetTag} ᴊᴇ ɴᴇ sᴀɪs pas ᴄᴇ ǫᴜɪ ᴇsᴛ ʟᴇ ᴘʟᴜs ʙᴇᴀᴜ... ʟᴇ sᴏʟᴇɪʟ ᴏᴜ ᴛᴏɪ.* ☀️`
        ];

        const randomFlirt = flirts[Math.floor(Math.random() * flirts.length)];

        await sock.sendMessage(extra.from, {
          text: randomFlirt,
          mentions: [targetId]
        }, { quoted: msg });

      } catch (error) {
        console.error('Flirt Error:', error);
        await extra.reply(`❌ Error: ${error.message}`);
      }
    }
};
