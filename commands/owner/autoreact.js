/**
 * Auto-React System - AGM Elite Configuration
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const { load, save } = require('../../utils/autoReact');

// --- FONCTION DE DESIGN AGM (CONFIG STYLE) ---
const AGM_CONFIG = (status, mode) => `╭╼━≪• ᴀɢᴍ ᴀᴜᴛᴏ-ʀᴇᴀᴄᴛ •≫━╾╮
┃ sᴛᴀᴛᴜs : ${status ? '🟢 ᴇɴᴀʙʟᴇᴅ' : '🔴 ᴅɪsᴀʙʟᴇᴅ'}
┃ ᴍᴏᴅᴇ : ${mode.toUpperCase()} ⚡
┃ sʏsᴛᴇᴍ : ᴏᴘᴇʀᴀᴛɪᴏɴᴀʟ ✅
╰━━━━━━━━━━━━━━━╯
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`;

module.exports = {
  name: 'autoreact',
  aliases: ['ar', 'react'],
  category: 'owner',
  description: 'Configurer les réactions automatiques',
  usage: '.ar <on/off/set bot/set all>',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    try {
      const db = load();
      const opt = args.join(' ').toLowerCase();

      if (!opt) {
        return extra.reply(
          `╭╼━≪• ᴀʀ ᴏᴘᴛɪᴏɴs •≫━╾╮\n` +
          `┃ • *on* : Activer\n` +
          `┃ • *off* : Désactiver\n` +
          `┃ • *set bot* : Commandes uniquement\n` +
          `┃ • *set all* : Tous les messages\n` +
          `╰━━━━━━━━━━━━━━━╯`
        );
      }

      let message = "";

      if (opt === 'on') {
        db.enabled = true;
        save(db);
        message = AGM_CONFIG(true, db.mode || 'bot');
      } 
      else if (opt === 'off') {
        db.enabled = false;
        save(db);
        message = AGM_CONFIG(false, db.mode || 'bot');
      } 
      else if (opt === 'set bot') {
        db.mode = 'bot';
        save(db);
        message = "🤖 *ᴍᴏᴅᴇ : ᴄᴏᴍᴍᴀɴᴅᴇs ᴜɴɪǫᴜᴇᴍᴇɴᴛ (⏳)*";
      } 
      else if (opt === 'set all') {
        db.mode = 'all';
        save(db);
        message = "🌟 *ᴍᴏᴅᴇ : ᴛᴏᴜs ʟᴇs ᴍᴇssᴀɢᴇs (ʀᴀɴᴅᴏᴍ)*";
      } 
      else {
        return extra.reply('❌ *ᴏᴘᴛɪᴏɴ ɪɴᴠᴀʟɪᴅᴇ. (ᴏɴ | ᴏғғ | sᴇᴛ ʙᴏᴛ | sᴇᴛ ᴀʟʟ)*');
      }

      await sock.sendMessage(extra.from, { react: { text: '⚙️', key: msg.key } });
      await extra.reply(message);

    } catch (err) {
      console.error('[AUTOREACT ERROR]:', err);
      await extra.reply('❌ *ᴇʀʀᴇᴜʀ ᴅᴇ ᴄᴏɴғɪɢᴜʀᴀᴛɪᴏɴ ᴀᴜᴛᴏ-ʀᴇᴀᴄᴛ.*');
    }
  }
};
