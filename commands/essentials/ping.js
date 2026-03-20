/**
 * Ping Command - AGM System Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

// --- FONCTION DE DESIGN AGM ADAPTÉE ---
const AGM_DESIGN = (latency) => `╭╼━≪• sʏsᴛᴇᴍ ᴘɪɴɢ •≫━╾╮
┃ sᴛᴀᴛᴜs : 🟢 ᴏɴʟɪɴᴇ
┃ ʟᴀᴛᴇɴᴄʏ : ${latency}ᴍs ⚡
┃ sᴘᴇᴇᴅ : 🛡️ ᴇʟɪᴛᴇ
>┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗
╰━━━━━━━━━━━━━━━╯`;

module.exports = {
    name: 'ping',
    aliases: ['p'],
    category: 'essentials',
    description: 'Check bot response time',
    usage: '.ping',
    
    async execute(sock, msg, args, extra) {
      try {
        const start = Date.now();
        
        // Petit message d'attente stylisé
        const sent = await extra.reply('📡 *sᴄᴀɴɴɪɴɢ sʏsᴛᴇᴍ...*');
        
        const end = Date.now();
        const responseTime = end - start;
        
        // Modification du message pour afficher le design final
        await sock.sendMessage(extra.from, {
          text: AGM_DESIGN(responseTime),
          edit: sent.key
        });

        // Réaction de vitesse
        await sock.sendMessage(extra.from, { react: { text: "⚡", key: msg.key } });
        
      } catch (error) {
        console.error('Ping error:', error);
        await extra.reply(`❌ ᴇʀʀᴇᴜʀ : ${error.message}`);
      }
    }
  };
