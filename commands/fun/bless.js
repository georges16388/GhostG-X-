/**
 * Divine Blessing Command - Glorify God and Jesus
 * Custom Design by -ɢʜᴏsᴛɢ 𝐗
 */

// Design pour la bénédiction divine
const BLESS_DESIGN = (text) => `╭╼━≪• ɢʜᴏsᴛ ʙʟᴇssɪɴɢ •≫━╾╮
┃ ᴍsɢ : ${text}
┃ ᴛʏᴘᴇ : ɢʟᴏʀʏ ᴛᴏ ɢᴏᴅ 🙌
┃ ғʀᴏᴍ : ɢʜᴏsᴛ ᴀɪ 🕊️
> ┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗
╰━━━━━━━━━━━━━━━╯`;

module.exports = {
    name: 'bless',
    aliases: ['compliment', 'grace', 'amen'],
    category: 'faith',
    desc: 'Send a divine blessing glorifying God',
    usage: 'bless [@user]',
    execute: async (sock, msg, args, extra) => {
      try {
        const blessings = [
          "Dieu soit loué d'avoir fait de toi une si belle créature ! ✨",
          "Que la grâce du Seigneur Jésus repose sur ta vie aujourd'hui. 🕊️",
          "Tu es un chef-d'œuvre merveilleux entre les mains du Créateur ! 🎨",
          "Que l'amour de Dieu illumine ton visage et ton cœur. 💖",
          "En te voyant, on voit la bonté infinie du Seigneur. 🙌",
          "Tu es une bénédiction que Dieu a envoyée dans ce monde ! 🌟",
          "Que Jésus-Christ guide chacun de tes pas vers la lumière. 🕯️",
          "Dieu a mis en toi une étincelle unique de Sa gloire ! 💎",
          "Sois béni(e) au nom du Seigneur pour la pureté de ton âme. 🌈",
          "Le Seigneur a fait de grandes choses pour toi, réjouis-toi ! 😊",
          "Tu es précieu(x/se) aux yeux de Dieu, Il t'aime infiniment. ❤️",
          "Que la paix de Christ, qui surpasse toute intelligence, garde ton cœur. 🛡️"
        ];
        
        const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;
        const mentioned = ctxInfo?.mentionedJid || [];
        const randomBlessing = blessings[Math.floor(Math.random() * blessings.length)];
        
        const chatId = msg.key.remoteJid;
        let finalMessage = randomBlessing;

        // Ciblage automatique de la personne mentionnée ou de la réponse
        if (mentioned.length > 0) {
            finalMessage = `@${mentioned[0].split('@')[0]}, ${randomBlessing.charAt(0).toLowerCase() + randomBlessing.slice(1)}`;
        } else if (ctxInfo?.participant) {
            finalMessage = `@${ctxInfo.participant.split('@')[0]}, ${randomBlessing.charAt(0).toLowerCase() + randomBlessing.slice(1)}`;
            mentioned.push(ctxInfo.participant);
        }

        await sock.sendMessage(chatId, {
          text: BLESS_DESIGN(finalMessage),
          mentions: mentioned.length > 0 ? mentioned : []
        }, { quoted: msg });
        
      } catch (error) {
        console.error('Blessing Error:', error);
        await sock.sendMessage(msg.key.remoteJid, {
          text: `❌ Error: ${error.message}`
        }, { quoted: msg });
      }
    }
  };
