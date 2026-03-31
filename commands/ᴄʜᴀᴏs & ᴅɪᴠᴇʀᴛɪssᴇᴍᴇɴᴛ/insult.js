/**
 * Insult - Give a silly insult to a user
 */

module.exports = {
  name: 'ᴍᴀʟᴇᴅɪᴄᴛɪᴏɴ',
  aliases: ['insultme','burn', 'insult', 'insulter', 'malediction', 'malédiction'],
  category:  '♞  ᴄʜᴀᴏs & ᴅɪᴠᴇʀᴛɪssᴇᴍᴇɴᴛ',
  description: 'Give a silly insult to a user. Reply or mention to target someone.',
  usage: '.ᴍᴀʟᴇᴅɪᴄᴛɪᴏɴ (reply or @user)',
  
  async execute(sock, msg, args, extra) {
    try {
      const ctx = msg.message?.extendedTextMessage?.contextInfo || {};
      const mentioned = ctx.mentionedJid || [];
      let targetId = null;
      
      if (mentioned.length) {
        targetId = mentioned[0];
      } else if (ctx.participant) {
        targetId = ctx.participant;
      } else {
        targetId = extra.sender;
      }

      const targetTag = `@${targetId.split('@')[0]}`;

      const insults = [
        `*${targetTag} ᴛᴀ ᴛᴇ̂ᴛᴇ ʀᴇssᴇᴍʙʟᴇ ᴀ̀ ᴄᴇʟʟᴇ ᴅ'ᴜɴ ᴍɪʟʟɪᴀʀᴅᴀɪʀᴇ... ᴍᴀɪs sᴀɴs ʟᴇs sᴏᴜs !* 💸`,
        `*${targetTag} ᴛᴜ ᴀs ʟᴀ ᴄʜᴀɴᴄᴇ ǫᴜᴇ ᴊᴇ́sᴜs sᴏɪᴛ ᴅᴀɴs ᴍᴀ ᴠɪᴇ, sɪɴᴏɴ...* 😤`,
        `*${targetTag} ᴛᴏɴ ɪɴᴛᴇʟʟɪɢᴇɴᴄᴇ ᴇsᴛ ᴄᴏᴍᴍᴇ ᴜɴ ᴄʀᴀʏᴏɴ ʙʟᴀɴᴄ : ᴛᴏᴛᴀʟᴇᴍᴇɴᴛ ɪɴᴜᴛɪʟᴇ.* 🖍️`,
        `*${targetTag} ᴊᴇ ᴛ'ᴀᴜʀᴀɪs ʙɪᴇɴ ᴅɪᴛ ǫᴜᴇ ᴛᴜ ᴇs ᴜɴᴇ ʟᴜᴍɪᴇ̀ʀᴇ, ᴍᴀɪs ᴊᴇ ɴᴇ ᴠᴇᴜx ᴘᴀs ᴏғғᴇɴsᴇʀ ʟᴇs ᴀᴍᴘᴏᴜʟᴇs.* 💡`,
        `*${targetTag} ᴛᴜ ᴇs ᴄᴏᴍᴍᴇ ᴜɴ ɴᴜᴀɢᴇ. ǫᴜᴀɴᴅ ᴛᴜ ᴅɪsᴘᴀʀᴀɪs, ʟᴀ ᴊᴏᴜʀɴᴇ́ᴇ ᴅᴇᴠɪᴇɴᴛ ᴍᴀɢɴɪғɪǫᴜᴇ.* ☀️`,
        `*${targetTag} ᴛᴜ ᴀᴘᴘᴏʀᴛᴇs ᴛᴇʟʟᴇᴍᴇɴᴛ ᴅᴇ ᴊᴏɪᴇ ᴀ̀ ᴛᴏᴜᴛ ʟᴇ ᴍᴏɴᴅᴇ... ǫᴜᴀɴᴅ ᴛᴜ ǫᴜɪᴛᴛᴇs ʟᴇ sᴀɴᴄᴛᴜᴀɪʀᴇ.* 🚪`,
        `*${targetTag} sɪ ʟᴀ ᴘᴀʀᴇssᴇ ᴇ́ᴛᴀɪᴛ ᴜɴ sᴘᴏʀᴛ ᴏʟʏᴍᴘɪǫᴜᴇ, ᴛᴜ sᴇʀᴀɪs ǫᴜᴀᴛʀɪᴇ̀ᴍᴇ... ᴘᴏᴜʀ ɴᴇ ᴘᴀs ᴀᴠᴏɪʀ ᴀ̀ ᴍᴏɴᴛᴇʀ sᴜʀ ʟᴇ ᴘᴏᴅɪᴜᴍ !* 🥉`,
        `*${targetTag} ᴛᴜ ᴇs ʟᴇ ɢᴇɴʀᴇ ᴅᴇ ᴘᴇʀsᴏɴɴᴇ ǫᴜɪ ᴀ ʙᴇsᴏɪɴ ᴅᴇ ʟɪʀᴇ ʟᴀ ɴᴏᴛɪᴄᴇ ᴘᴏᴜʀ ᴍᴀɴɢᴇʀ ᴜɴ ᴄʜᴏᴄᴏʟᴀᴛ.* 🍫`,
        `*${targetTag} ᴛᴏɴ ᴄᴇʀᴠᴇᴀᴜ ᴇsᴛ ᴇɴ sᴛᴀɴᴅ-ʙʏ ᴅᴇᴘᴜɪs ʟᴀ ᴄʀᴇ́ᴀᴛɪᴏɴ ᴅᴜ ᴍᴏɴᴅᴇ.* 💤`,
        `*${targetTag} ᴛᴜ ᴇs ʟᴀ ᴘʀᴇᴜᴠᴇ ᴠɪᴠᴀɴᴛᴇ ǫᴜᴇ ʟᴇ ᴄᴇʀᴠᴇᴀᴜ ᴇsᴛ ᴜɴ ᴏʀɢᴀɴᴇ ᴇxᴛʀᴇ̂ᴍᴇᴍᴇɴᴛ sᴇᴘᴀʀᴇ́ ᴅᴇ ʟᴀ ʙᴏᴜᴄʜᴇ.* 🧠`,
        `*${targetTag} ᴛᴜ ᴇs ᴀᴜssɪ ᴜᴛɪʟᴇ ǫᴜ'ᴜɴᴇ ᴘᴏʀᴛᴇ sᴜʀ ᴜɴᴇ ᴍᴏᴛᴏ.* 🏍️`,
        `*${targetTag} sɪ ʟᴀ ʙᴇ̂ᴛɪsᴇ sᴇ ᴍᴇsᴜʀᴀɪᴛ ᴇɴ ᴋɪʟᴏᴍᴇ̀ᴛʀᴇs, ᴛᴜ sᴇʀᴀɪs ʟᴇ sᴘᴀᴛɪᴏᴅʀᴏᴍᴇ.* 🚀`,
        `*${targetTag} ᴊᴇ ᴘᴇɴsᴀɪs ǫᴜᴇ ʟᴇ ᴠɪᴅᴇ ᴀʙsᴏʟᴜ ɴ'ᴇxɪsᴛᴀɪᴛ ǫᴜᴇ ᴅᴀs ʟ'ᴇsᴘᴀᴄᴇ, ᴊᴜsǫᴜ'ᴀ̀ ᴄᴇ ǫᴜᴇ ᴊᴇ ᴛᴇ ᴠᴏɪᴇ.* 🌌`,
        `*${targetTag} sɪ ᴛᴜ sᴀᴜᴛᴀɪs ᴅᴜ ʜᴀᴜᴛ ᴅᴇ ᴛᴏɴ ᴇɢᴏ ᴊᴜsǫᴜ'ᴀ̀ ᴛᴏɴ I.Q, ᴛᴜ ᴛᴇ ғᴇʀᴀɪs ᴛʀᴇ̀s ᴍᴀʟ.* 📉`,
        `*${targetTag} ᴛᴏɴ sᴛʏʟᴇ ᴇsᴛ ᴀᴜssɪ ʀᴀғғɪɴᴇ́ ǫᴜ'ᴜɴᴇ ᴘᴀɪʀᴇ ᴅᴇ sᴀʙᴏᴛs ᴇɴ ᴘʟᴀsᴛɪǫᴜᴇ ᴀᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ.* 👡`,
        `*${targetTag} ᴛᴜ ᴇs ʟᴇ sᴇᴜʟ ᴀ̂ᴍᴇ ᴄᴀᴘᴀʙʟᴇ ᴅᴇ ғᴀɪʀᴇ sᴜʀᴄʜᴀᴜғғᴇʀ ᴜɴᴇ ᴄᴀʟᴄᴜʟᴀᴛʀɪᴄᴇ ᴘᴏᴜʀ ғᴀɪʀᴇ 1+1.* 🧮`,
        `*${targetTag} ᴛᴇs ɪᴅᴇ́ᴇs sᴏɴᴛ ᴄᴏᴍᴍᴇ ᴅᴇs ғɪᴄʜɪᴇʀs ᴄᴏʀʀᴏᴍᴘᴜs : ɪɴᴏᴜᴠʀᴀʙʟᴇs ᴇᴛ sᴀɴs ᴠᴀʟᴇᴜʀ.* 📁`,
        `*${targetTag} ᴛᴜ ᴀs ᴜɴ ɢʀᴀɴᴅ ᴛᴀʟᴇɴᴛ ᴘᴏᴜʀ ᴘᴀʀʟᴇʀ ᴘᴇɴᴅᴀɴᴛ ᴅᴇs ʜᴇᴜʀᴇs sᴀɴs ᴊᴀᴍᴀɪs ʀɪᴇɴ ᴅɪʀᴇ.* 🗣️`
      ];

      const line = insults[Math.floor(Math.random() * insults.length)];
      
      await sock.sendMessage(extra.from, { 
        text: line, 
        mentions: [targetId] 
      }, { quoted: msg });
      
    } catch (error) {
      console.error('[insult] ERROR:', error);
      await extra.reply(`❌ *ᴇʀʀᴇᴜʀ :* ${error.message}`);
    }
  }
};
