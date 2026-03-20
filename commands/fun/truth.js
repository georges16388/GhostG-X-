/**
 * Truth - Get a random truth question
 * Custom Design by -ɢʜᴏsᴛɢ 𝐗
 */

const { truth } = require('@bochilteam/scraper');
const { translate } = require('@vitalets/google-translate-api');

// Design pour la question (Vérité)
const TRUTH_DESIGN = (question) => `╭╼━≪• ɢʜᴏsᴛ ᴛʀᴜᴛʜ •≫━╾╮
┃ ǫᴜᴇsᴛɪᴏɴ : ${question} 🤔
┃ ᴛʏᴘᴇ : ᴠᴇʀɪᴛᴇ 📝
┃ sᴛᴀᴛᴜs : ᴀᴛᴛᴇɴᴛᴇ... ⌛
> ┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗
╰━━━━━━━━━━━━━━━╯`;

module.exports = {
    name: 'truth',
    aliases: ['verite', 'vrt'],
    category: 'fun',
    desc: 'Obtenir une question de vérité aléatoire',
    usage: 'truth [@user]',
    execute: async (sock, msg, args, extra) => {
      try {
        // Récupération de la question (souvent en indonésien via ce scraper)
        const rawQuestion = await truth();
        
        // Traduction automatique en Français pour ta communauté
        const res = await translate(rawQuestion, { to: 'fr' });
        const questionFr = res.text;
        
        const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;
        const mentioned = ctxInfo?.mentionedJid || [];
        const chatId = msg.key.remoteJid;
        
        let finalQuestion = questionFr;

        // Ciblage automatique de la personne mentionnée ou de la réponse
        if (mentioned.length > 0) {
            finalQuestion = `@${mentioned[0].split('@')[0]}, réponds honnêtement : ${questionFr}`;
        } else if (ctxInfo?.participant) {
            finalQuestion = `@${ctxInfo.participant.split('@')[0]}, réponds honnêtement : ${questionFr}`;
            mentioned.push(ctxInfo.participant);
        }

        // Réaction pour l'ambiance
        await sock.sendMessage(chatId, { react: { text: "🧐", key: msg.key } });

        await sock.sendMessage(chatId, {
          text: TRUTH_DESIGN(finalQuestion),
          mentions: mentioned.length > 0 ? mentioned : []
        }, { quoted: msg });
        
      } catch (error) {
        console.error('Truth Error:', error);
        // Fallback en cas d'erreur de l'API ou de traduction
        const fallbackQuestions = [
            "Quelle est la chose la plus folle que tu aies faite par amour ?",
            "Quel est ton plus grand secret que personne ici ne connaît ?",
            "As-tu déjà menti pour sortir d'un problème sérieux ?",
            "Qui est ton crush actuel dans ce groupe ?"
        ];
        const randomFB = fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)];
        await extra.reply(TRUTH_DESIGN(randomFB));
      }
    }
  };
