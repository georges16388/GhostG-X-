/**
 * Flirt - Get a random flirty message from API
 * Custom Design by -ɢʜᴏsᴛɢ 𝐗
 */

const axios = require('axios');

// Design pour le message de drague
const FLIRT_DESIGN = (text) => `╭╼━≪• *ɢʜᴏsᴛ ғʟɪʀᴛ* •≫━╾╮
┃ *ᴍsɢ* : ${text}
┃ *ᴛʏᴘᴇ* : ᴘɪᴄᴋᴜᴘ ʟɪɴᴇ ✨
┃ *sᴛᴀᴛᴜs* : sᴍᴏᴏᴛʜ... 😏
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

module.exports = {
    name: 'flirt',
    aliases: ['pickup', 'pickupline'],
    category: 'fun',
    desc: 'Get a random flirty pickup line',
    usage: 'flirt [@user]',
    execute: async (sock, msg, args, extra) => {
      try {
        // Récupération de la phrase via l'API
        const response = await axios.get('https://api.shizo.top/quote/flirt?apikey=shizo');
        
        if (!response.data || !response.data.result) {
          throw new Error('Invalid API response');
        }
        
        const flirtText = response.data.result;
        const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;
        const mentioned = ctxInfo?.mentionedJid || [];
        
        const chatId = extra.from;
        let finalMessage = flirtText;

        // Ciblage automatique de la personne mentionnée ou de la réponse
        if (mentioned.length > 0) {
            finalMessage = `@${mentioned[0].split('@')[0]}, ${flirtText}`;
        } else if (ctxInfo?.participant) {
            finalMessage = `@${ctxInfo.participant.split('@')[0]}, ${flirtText}`;
            mentioned.push(ctxInfo.participant);
        }

        await sock.sendMessage(chatId, {
          text: FLIRT_DESIGN(finalMessage),
          mentions: mentioned.length > 0 ? mentioned : []
        }, { quoted: msg });
        
      } catch (error) {
        console.error('Flirt Error:', error);
        await extra.reply(`❌ AI Error: ${error.message}`);
      }
    }
  };
