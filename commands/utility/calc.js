/**
 * Calculator Command - AGM Logic Core
 * Typographie : ꜱᴍᴀʟʟ ᴄᴀᴘꜱ ᴘʀᴇᴍɪᴜᴍ
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

// --- FONCTION DE DESIGN AGM (CALC STYLE) ---
const AGM_CALC = (exp, res) => `╭╼━≪• ᴀɢᴍ ᴄᴀʟᴄᴜʟᴀᴛᴏʀ •≫━╾╮
┃ ᴇxᴘ : ${exp} 🔢
┃ ꜱᴛᴀᴛᴜꜱ : 🟢 ꜱᴏʟᴠᴇᴅ
┃ ʀᴇꜱᴜʟᴛ : ${res} ✅
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

module.exports = {
  name: 'calc',
  aliases: ['calculate', 'math'],
  category: 'utility',
  description: 'Effectuer des calculs mathématiques',
  usage: '.calc <expression>',
  
  async execute(sock, msg, args, extra) {
    try {
      const expression = args.join(' ');
      const chatId = extra.from;
      
      if (!expression) {
        return await extra.reply('⚠️ *ᴜꜱᴀɢᴇ :* .ᴄᴀʟᴄ <ᴇxᴘʀᴇꜱꜱɪᴏɴ>\n*ᴇxᴇᴍᴘʟᴇ :* .ᴄᴀʟᴄ 5 + 3 * 2');
      }
      
      // Sécurité : on n'autorise que les chiffres et les opérateurs de base
      if (!/^[0-9+\-*/(). ]+$/.test(expression)) {
        return await extra.reply('❌ *ᴀᴄᴄᴇ̀ꜱ ʀᴇꜰᴜꜱᴇ́ :* ᴜɴɪǫᴜᴇᴍᴇɴᴛ ʟᴇꜱ ᴄʜɪꜰꜰʀᴇꜱ ᴇᴛ (+, -, *, /) ꜱᴏɴᴛ ᴀᴜᴛᴏʀɪꜱᴇ́ꜱ.');
      }
      
      // Réaction de calcul
      await sock.sendMessage(chatId, { react: { text: '🧠', key: msg.key } });

      try {
        // Utilisation de Function au lieu de eval pour une légère sécurité en plus
        const result = new Function(`return ${expression}`)();
        
        // Vérification si le résultat est un nombre valide
        if (isNaN(result) || !isFinite(result)) {
            throw new Error('ᴍᴀᴛʜ_ᴇʀʀᴏʀ');
        }

        await sock.sendMessage(chatId, {
          text: AGM_CALC(expression, result)
        }, { quoted: msg });

      } catch (mathError) {
        await extra.reply('❌ *ᴇxᴘʀᴇꜱꜱɪᴏɴ ɪɴᴠᴀʟɪᴅᴇ !*');
      }
      
    } catch (error) {
      console.error('Error in calc command:', error);
      await extra.reply(`❌ *ꜱʏꜱᴛᴇᴍ ᴇʀʀᴏʀ :* ${error.message}`);
    }
  }
};
