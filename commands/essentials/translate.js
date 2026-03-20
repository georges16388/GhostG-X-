/**
 * Translate Command - AGM Linguistic Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const APIs = require('../../utils/api');

// --- FONCTION DE DESIGN AGM ADAPTÉE ---
const AGM_DESIGN = (lang, original, translated) => {
  // On tronque si le texte est trop long pour le cadre
  const shortOriginal = original.length > 20 ? original.substring(0, 17) + '...' : original;
  const shortTranslated = translated.length > 20 ? translated.substring(0, 17) + '...' : translated;

  return `╭╼━≪• ᴛʀᴀɴsʟᴀᴛᴇ sʏsᴛᴇᴍ •≫━╾╮
┃ ғʀᴏᴍ : ${shortOriginal}
┃ ᴛᴏ : ${shortTranslated} 🔄
┃ ʟᴀɴɢ : ${lang.toUpperCase()} 🌍
>┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗
╰━━━━━━━━━━━━━━━╯`;
};

module.exports = {
  name: 'translate',
  aliases: ['tr', 'trans'],
  category: 'essentials',
  description: 'Translate text to another language',
  usage: '.translate <lang code> <text>',
  
  async execute(sock, msg, args, extra) {
    try {
      if (args.length < 2) {
        return extra.reply('⚠️ *ᴜsᴀɢᴇ : .ᴛʀᴀɴsʟᴀᴛᴇ <ʟᴀɴɢ> <ᴛᴇxᴛᴇ>*\n*ᴇx : .ᴛʀᴀɴsʟᴀᴛᴇ ғʀ ʜᴇʟʟᴏ ᴡᴏʀʟᴅ*');
      }
      
      const targetLang = args[0];
      const text = args.slice(1).join(' ');
      
      // Réaction de traitement
      await sock.sendMessage(extra.from, { react: { text: "🌐", key: msg.key } });
      
      const result = await APIs.translate(text, targetLang);
      const translation = result.translation || result;
      
      // Envoi du résultat avec le design AGM
      await extra.reply(AGM_DESIGN(targetLang, text, translation));

      // Si le texte est long, on envoie la version complète en dessous pour la lecture
      if (translation.length > 20 || text.length > 20) {
        await extra.reply(`📖 *ғᴜʟʟ ᴛᴇxᴛ :*\n\n${translation}`);
      }
      
    } catch (error) {
      console.error('Translation error:', error);
      await extra.reply(`❌ *ᴇᴄʜᴇᴄ ᴅᴇ ʟᴀ ᴛʀᴀᴅᴜᴄᴛɪᴏɴ.*\n*ᴄᴏᴅᴇs sᴜᴘᴘᴏʀᴛés : ᴇɴ, ᴇs, ғʀ, ᴅᴇ, ɪᴛ, ᴘᴛ, ʀᴜ...*`);
    }
  }
};
