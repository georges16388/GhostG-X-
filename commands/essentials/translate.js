/**
 * Translate Command - AGM Linguistic Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const APIs = require('../../utils/api');

// Fonction de conversion en Small Caps
const toSmallCaps = (text) => {
    const smallCapsMap = {
        'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 
        'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 
        'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 
        'y': 'ʏ', 'z': 'ᴢ'
    };
    return text.toString().toLowerCase().split('').map(char => smallCapsMap[char] || char).join('');
};

// --- DESIGN AGM ADAPTÉ ---
const AGM_DESIGN = (lang, original, translated) => {
  const shortOriginal = original.length > 20 ? original.substring(0, 17) + '...' : original;
  const shortTranslated = translated.length > 20 ? translated.substring(0, 17) + '...' : translated;

  return `╭╼━≪• *ᴛʀᴀɴsʟᴀᴛᴇ sʏsᴛᴇᴍ* •≫━╾╮
┃ 
┃ ${toSmallCaps('ᴅᴇ')} : ${shortOriginal}
┃ ${toSmallCaps('ᴠᴇʀs')} : ${shortTranslated} 🔄
┃ ${toSmallCaps('ʟᴀɴɢ')} : ${lang.toUpperCase()} 🌍
┃ 
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;
};

module.exports = {
  name: 'translate',
  aliases: ['traduire', 'trans'],
  category: 'essentials',
  description: 'Traduire un texte dans une autre langue',
  usage: '.translate <code_langue> <texte>',

  async execute(sock, msg, args, extra) {
    try {
      if (args.length < 2) {
        const usageMsg = toSmallCaps("usage : .translate <lang> <texte>");
        const exMsg = toSmallCaps("ex : .translate en bonjour");
        return extra.reply(`⚠️ *${usageMsg}*\n*${exMsg}*`);
      }

      const targetLang = args[0].toLowerCase();
      const text = args.slice(1).join(' ');

      // Réaction de traitement
      await sock.sendMessage(extra.from, { react: { text: "🌐", key: msg.key } });

      // Appel à ton utilitaire de traduction
      const result = await APIs.translate(text, targetLang);
      
      // Gestion de la réponse selon la structure de ton API
      const translation = result.translation || result.text || result;

      if (!translation) throw new Error("Traduction vide");

      // Envoi du cadre AGM (version courte/aperçu)
      await extra.reply(AGM_DESIGN(targetLang, text, translation));

      // Si le texte est long, on envoie la version complète pour le confort de lecture
      if (translation.length > 20 || text.length > 20) {
        const fullHeader = toSmallCaps("texte complet :");
        await extra.reply(`📖 *${fullHeader}*\n\n${translation}`);
      }

    } catch (error) {
      console.error('Translation error:', error);
      const errMsg = toSmallCaps("echec de la traduction");
      const supportMsg = toSmallCaps("codes supportes : en, es, fr, de, it, pt...");
      await extra.reply(`❌ *${errMsg}*\n*${supportMsg}*`);
    }
  }
};
