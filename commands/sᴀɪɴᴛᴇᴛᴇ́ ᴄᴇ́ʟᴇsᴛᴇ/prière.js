/**
 * Prier Command - GhostG-X Edition
 * Génère une prière unique et puissante basée sur des briques spirituelles.
 * Supporte : Les mentions, les réponses (reply) et l'auto-prière.
 * Category : ♰ sᴀɪɴᴛᴇᴛᴇ́ ᴄᴇ́ʟᴇsᴛᴇ
 * Powered by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

module.exports = {
  name: 'prier',
  aliases: ['priere', 'prière','interceder', 'oraison', 'ᴘʀɪᴇʀ'],
  category: '♰ sᴀɪɴᴛᴇᴛᴇ́ ᴄᴇ́ʟᴇsᴛᴇ',
  description: 'Génère une sainte prière d\'intercession ou de protection.',
  usage: '.prier [@user ou en réponse à un message]',
  
  async execute(sock, msg, args, extra) {
    try {
      const ctx = msg.message?.extendedTextMessage?.contextInfo || {};
      const mentioned = ctx.mentionedJid || [];
      let targetId = null;

      // --- DÉTECTION DE LA CIBLE (Priorités) ---
      
      // 1. Si l'utilisateur a mentionné quelqu'un (@user)
      if (mentioned.length > 0) {
        targetId = mentioned[0];
      } 
      // 2. S'il n'y a pas de mention mais que l'utilisateur a répondu (reply) à un message
      else if (ctx.participant) {
        targetId = ctx.participant;
      } 
      // 3. Si aucune mention et aucun reply, la cible est l'auteur du message lui-même
      else {
        targetId = msg.key.participant || msg.key.remoteJid;
      }

      const targetTag = `@${targetId.split('@')[0]}`;

      // --- BRIQUES DE LA FORGE DE PRIÈRES ---
      const intros = [
        "ᴘᴇ̀ʀᴇ ᴄᴇ́ʟᴇsᴛᴇ, ɴᴏᴜs ᴘʟᴀᴄ̧ᴏɴs",
        "sᴇɪɢɴᴇᴜʀ ᴛᴏᴜᴛ-ᴘᴜɪssᴀɴᴛ, ᴊᴇ ᴛ'ᴀᴘᴘᴏʀᴛᴇ",
        "ᴅɪᴇᴜ ᴅᴇ ɢʀᴀ̂ᴄᴇ, ᴊᴇ ᴛᴇ ᴘʀᴇ́sᴇɴᴛᴇ",
        "ᴍᴀɪ̂ᴛʀᴇ ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ, ɴᴏᴜs ʀᴇᴍᴇᴛᴛᴏɴs"
      ];

      const actions = [
        "ᴇɴᴛᴏᴜʀᴇ ᴄᴇᴛᴛᴇ ᴀ̂ᴍᴇ ᴅᴇ ᴛᴏɴ ʙᴏᴜᴄʟɪᴇʀ ᴅᴇ ғᴇᴜ",
        "ɪɴᴏɴᴅᴇ sᴏɴ ᴄᴏᴇᴜʀ ᴅᴇ ᴛᴀ ᴘᴀɪx sᴜʀɴᴀᴛᴜʀᴇʟʟᴇ",
        "ʙʀɪsᴇ ᴛᴏᴜᴛᴇs ʟᴇs ᴄʜᴀɪ̂ɴᴇs ᴅᴇ ʟ'ᴇɴɴᴇᴍɪ ᴀᴜᴛᴏᴜʀ ᴅᴇ",
        "ᴏᴜᴠʀᴇ ʟᴇs ᴇ́ᴄʟᴜsᴇs ᴅᴇs ᴄɪᴇᴜx ᴘᴏᴜʀ ʙᴇ́ɴɪʀ",
        "ᴅᴏɴɴᴇ-ʟᴜɪ ʟᴀ ғᴏʀᴄᴇ ᴅᴇ ᴠᴀɪɴᴄʀᴇ ᴛᴏᴜs ʟᴇs ᴏʙsᴛᴀᴄʟᴇs"
      ];

      const desirs = [
        "ᴇᴛ ǫᴜᴇ ᴛᴀ ʟᴜᴍɪᴇ̀ʀᴇ ᴅɪssɪᴘᴇ ᴛᴏᴜᴛᴇs sᴇs ᴛᴇ́ɴᴇ̀ʙʀᴇs.",
        "ᴀғɪɴ ǫᴜ'ᴇʟʟᴇ ᴍᴀʀᴄʜᴇ ᴛᴏᴜᴊᴏᴜʀs ʟᴀ ᴛᴇ̂ᴛᴇ ʜᴀᴜᴛᴇ.",
        "ᴇᴛ ǫᴜᴇ ᴛᴀ sᴀɢᴇssᴇ ɢᴜɪᴅᴇ ᴄʜᴀᴄᴜɴ ᴅᴇ sᴇs ᴘᴀs.",
        "ᴄᴀʀ ᴛᴜ ᴇs sᴏɴ ʀᴏᴄʜᴇʀ ᴇᴛ sᴏɴ ʟɪʙᴇ́ʀᴀᴛᴇᴜʀ."
      ];

      const amens = [
        "ᴀᴜ ɴᴏᴍ ᴘᴜɪssᴀɴᴛ ᴅᴇ ᴊᴇ́sᴜs, ᴀᴍᴇɴ.",
        "ǫᴜᴇ ᴛᴀ ᴠᴏʟᴏɴᴛᴇ́ sᴏɪᴛ ғᴀɪᴛᴇ, ᴀᴍᴇɴ.",
        "ɴᴏᴜs sᴄᴇʟʟᴏɴs ᴄᴇᴛᴛᴇ ᴘᴀʀᴏʟᴇ, ᴀᴍᴇɴ.",
        "ᴀᴍᴇɴ ᴇᴛ ᴀᴍᴇɴ."
      ];

      // Piocher un élément au hasard dans chaque catégorie
      const rIntro = intros[Math.floor(Math.random() * intros.length)];
      const rAction = actions[Math.floor(Math.random() * actions.length)];
      const rDesir = desirs[Math.floor(Math.random() * desirs.length)];
      const rAmen = amens[Math.floor(Math.random() * amens.length)];

      // Construction de la prière unique
      const priereGeneree = `*${rIntro}* ${targetTag} *ᴇɴ ᴄᴇ ᴊᴏᴜʀ. ${rAction} ${rDesir} ${rAmen}* 🙏🕊️`;

      await sock.sendMessage(msg.key.remoteJid, {
        text: `╭╼━≪• *ᴏʀᴀɪsᴏɴ_sᴀɪɴᴛᴇ* •≫━╾╮\n` +
              `┃ *ᴘᴏᴜʀ* : ${targetTag}\n` +
              `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
              `${priereGeneree}\n\n` +
              `*_❤️ ᴊᴇsᴜs ᴛᴀɪᴍᴇ ᴇᴛ ᴛᴇ ʙᴇ́ɴɪssᴇ_❤️*\n` +
              `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`,
        mentions: [targetId]
      }, { quoted: msg });

    } catch (error) {
      console.error('Prier Command Error:', error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ *ᴇʀʀᴇᴜʀ :* ${error.message}`
      }, { quoted: msg });
    }
  }
};
