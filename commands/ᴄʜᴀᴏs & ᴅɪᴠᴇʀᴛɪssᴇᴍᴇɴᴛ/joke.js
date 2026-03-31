/**
 * Joke Command - Send random jokes targeting a user
 */

module.exports = {
  name: 'ʙᴏᴜғғᴏɴ',
  aliases: ['jokes', 'joke', 'bouffon', 'blague'],
  category: '♞  ᴄʜᴀᴏs & ᴅɪᴠᴇʀᴛɪssᴇᴍᴇɴᴛ',
  description: 'Get random joke. Reply or mention to target someone.',
  usage: '.ʙᴏᴜғғᴏɴ [@user or reply to a message]',
  
  async execute(sock, msg, args, extra) {
    try {
      const ctx = msg.message?.extendedTextMessage?.contextInfo || {};
      const mentioned = ctx.mentionedJid || [];
      let targetId = null;
      
      // Détection de la cible : mention ou réponse
      if (mentioned.length) {
        targetId = mentioned[0];
      } else if (ctx.participant) {
        targetId = ctx.participant;
      } else {
        targetId = extra.sender;
      }

      const targetTag = `@${targetId.split('@')[0]}`;

      const jokes = [
        {
          setup: `*ᴘᴏᴜʀǫᴜᴏɪ ʟᴇs ᴘʟᴏɴɢᴇᴜʀs ᴘʟᴏɴɢᴇɴᴛ-ɪʟs ᴛᴏᴜᴊᴏᴜʀs ᴇɴ ᴀʀʀɪᴇ̀ʀᴇ ᴇᴛ ᴊᴀᴍᴀɪs ᴇɴ ᴀᴠᴀɴᴛ ? ᴅᴇᴍᴀɴᴅᴇᴢ ᴀ̀ ${targetTag} !*`,
          punchline: "*ᴘᴀʀᴄᴇ ǫᴜᴇ sɪɴᴏɴ ɪʟs ᴛᴏᴍʙᴇɴᴛ ᴅᴀɴs ʟᴇ ʙᴀᴛᴇᴀᴜ !* 🚤"
        },
        {
          setup: `*ǫᴜᴇ ғᴀɪᴛ ${targetTag} ǫᴜᴀɴᴅ ɪʟ ᴀ ғʀᴏɪᴅ ᴅᴇᴠᴀɴᴛ sᴏɴ ᴘᴄ ?*`,
          punchline: "*ɪʟ ғᴇʀᴍᴇ ʟᴇs ғᴇɴᴇ̂ᴛʀᴇs (ᴡɪɴᴅᴏᴡs) !* 🪟"
        },
        {
          setup: `*ᴘᴏᴜʀǫᴜᴏɪ ʟᴇs ᴏɪsᴇᴀᴜx ᴠᴏʟᴇɴᴛ-ɪʟs ᴠᴇʀs ʟᴇ sᴜᴅ ᴇɴ ʜɪᴠᴇʀ ? ᴄ'ᴇsᴛ ${targetTag} ǫᴜɪ ʟᴇᴜʀ ᴀ ᴅɪᴛ...*`,
          punchline: "*ᴘᴀʀᴄᴇ ǫᴜᴇ ᴄ'ᴇsᴛ ᴛʀᴏᴘ ʟᴏɴɢ ᴅ'ʏ ᴀʟʟᴇʀ ᴀ̀ ᴘɪᴇᴅ !* 🐧"
        },
        {
          setup: `*ǫᴜᴇʟ ᴇsᴛ ʟᴇ ᴄᴏᴍʙʟᴇ ᴘᴏᴜʀ ᴜɴ ᴇ́ʟᴇᴄᴛʀɪᴄɪᴇɴ ᴄᴏᴍᴍᴇ ${targetTag} ?*`,
          punchline: "*ᴄ'ᴇsᴛ ᴅᴇ ɴᴇ ᴘᴀs ᴇ̂ᴛʀᴇ ᴀᴜ ᴄᴏᴜʀᴀɴᴛ !* ⚡"
        },
        {
          setup: `*ǫᴜᴇ ᴅɪᴛ ᴜɴᴇ ɪᴍᴘʀɪᴍᴀɴᴛᴇ ᴅᴀɴs ʟ'ᴇᴀᴜ ? (ᴄ'ᴇsᴛ ʟᴀ ʙʟᴀɢᴜᴇ ᴘʀᴇ́ғᴇ́ʀᴇ́ᴇ ᴅᴇ ${targetTag})*`,
          punchline: "*ᴊ'ᴀɪ ᴘʟᴜs ᴅᴇ ᴘᴀᴘɪᴇʀ !* 🖨️"
        },
        {
          setup: `*ᴘᴏᴜʀǫᴜᴏɪ ʟᴇ ʟɪᴠʀᴇ ᴅᴇ ᴍᴀᴛʜs ᴅᴇ ${targetTag} ᴇsᴛ-ɪʟ ᴛᴏᴜᴊᴏᴜʀs sᴛʀᴇssᴇ́ ?*`,
          punchline: "*ᴘᴀʀᴄᴇ ǫᴜ'ɪʟ ᴀ ᴛʀᴏᴘ ᴅᴇ ᴘʀᴏʙʟᴇ̀ᴍᴇs !* 📚"
        },
        {
          setup: `*ǫᴜᴇ ғᴀɪᴛ ${targetTag} ǫᴜᴀɴᴅ ɪʟ ᴇsᴛ ᴇɴ ᴄᴏʟᴇ̀ʀᴇ ?*`,
          punchline: "*ɪʟ ᴅᴏɴɴᴇ ʟᴇ ᴛᴏɴ !* 🎵"
        },
        {
          setup: `*ᴘᴏᴜʀǫᴜᴏɪ ʟᴇs ʙᴀɴǫᴜɪᴇʀs ɴ'ᴀɪᴍᴇɴᴛ ᴘᴀs ʟᴀ ᴍᴇʀ ? ɴ'ᴇsᴛ-ᴄᴇ ᴘᴀs ${targetTag} ?*`,
          punchline: "*ᴘᴀʀᴄᴇ ǫᴜ'ɪʟs ᴏɴᴛ ᴘᴇᴜʀ ᴅᴇs ᴠᴀɢᴜᴇs ᴅᴇ ᴘᴇʀᴛᴇs !* 🌊"
        },
        {
          setup: `*ǫᴜᴇʟ ᴇsᴛ ʟᴇ ᴄᴏᴍʙʟᴇ ᴘᴏᴜʀ ᴜɴ ᴊᴏᴜᴇᴜʀ ᴅᴇ ᴄᴀʀᴛᴇs ᴄᴏᴍᴍᴇ ${targetTag} ?*`,
          punchline: "*ᴄ'ᴇsᴛ ᴅᴇ ᴘᴇʀᴅʀᴇ ʟᴀ ғᴀᴄᴇ !* 🃏"
        },
        {
          setup: `*ᴘᴏᴜʀǫᴜᴏɪ ʟᴇs sǫᴜᴇʟᴇᴛᴛᴇs ɴ'ᴀɪᴍᴇɴᴛ ᴘᴀs ғᴀɪʀᴇ ʟᴀ ғᴇ̂ᴛᴇ ᴀᴠᴇᴄ ${targetTag} ?*`,
          punchline: "*ᴘᴀʀᴄᴇ ǫᴜ'ɪʟs ɴ'ᴏɴᴛ ᴘᴇʀsᴏɴɴᴇ ᴀᴠᴇᴄ ǫᴜɪ ᴅᴀɴsᴇʀ !* 💀"
        },
        {
          setup: `*ǫᴜᴇ ᴅɪᴛ ᴜɴ ᴄɪᴛʀᴏɴ ǫᴜɪ ʀᴇɴᴄᴏɴᴛʀᴇ ${targetTag} ?*`,
          punchline: "*ʀɪᴇɴ, ɪʟs sᴏɴᴛ ᴘʀᴇssᴇ́s !* 🍋"
        },
        {
          setup: `*ᴘᴏᴜʀǫᴜᴏɪ ${targetTag} ᴀ-ᴛ-ɪʟ ᴘᴇᴜʀ ᴅᴇ ʟ'ᴏʀᴅɪɴᴀᴛᴇᴜʀ ?*`,
          punchline: "*ᴘᴀʀᴄᴇ ǫᴜ'ɪʟ ʏ ᴀ ᴜɴᴇ sᴏᴜʀɪs !* 🐭"
        },
        {
          setup: `*ǫᴜᴇ ғᴀɪᴛ ${targetTag} sᴜʀ ᴜɴ ᴄʜᴇᴠᴀʟ ?*`,
          punchline: "*ᴛᴀɢᴀᴅᴀ !* 🍓"
        },
        {
          setup: `*ᴘᴏᴜʀǫᴜᴏɪ ʟᴇ sᴏʟᴇɪʟ ᴇsᴛ-ɪʟ sɪ ʙʀɪʟʟᴀɴᴛ ? ɪʟ ᴠᴇᴜᴛ ʀᴇssᴇᴍʙʟᴇʀ ᴀ̀ ${targetTag}...*`,
          punchline: "*ᴘᴀʀᴄᴇ ǫᴜ'ɪʟ ғᴀɪᴛ sᴇs ᴅᴇᴠᴏɪʀs ᴛᴏᴜs ʟᴇs ᴊᴏᴜʀs !* ☀️"
        },
        {
          setup: `*ǫᴜᴇʟ ᴇsᴛ ʟᴇ ᴄᴏᴍʙʟᴇ ᴘᴏᴜʀ ᴜɴ ʙᴏᴜʟᴀɴɢᴇʀ ᴄᴏᴍᴍᴇ ${targetTag} ?*`,
          punchline: "*ᴄ'ᴇsᴛ ᴅᴇ ғᴀɪʀᴇ ᴅᴇ ʟᴀ ᴍᴀᴜᴠᴀɪsᴇ ᴘᴀ̂ᴛᴇ !* 🥖"
        }
      ];

      // Sélection d'une blague au hasard
      const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
      
      const text = `${randomJoke.setup}\n\n${randomJoke.punchline}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
      
      await sock.sendMessage(extra.from, { 
        text: text, 
        mentions: [targetId] 
      }, { quoted: msg });
      
    } catch (error) {
      console.error('[joke] ERROR:', error);
      await extra.reply(`❌ *ᴇʀʀᴇᴜʀ :* ${error.message}`);
    }
  }
};
