/**
 * Truth Command - Obtenir une question de vérité
 * Custom Design & UX by -ɢʜᴏsᴛɢ 𝐗
 */

const { truth } = require('@bochilteam/scraper');
const { translate } = require('@vitalets/google-translate-api');

// Fonction de conversion en Small Caps pour le style Ghost
const toSmallCaps = (text) => {
    const smallCapsMap = {
        'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 
        'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 
        'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 
        'y': 'ʏ', 'z': 'ᴢ'
    };
    return text.toString().toLowerCase().split('').map(char => smallCapsMap[char] || char).join('');
};

// Design pour la question (Vérité)
const TRUTH_DESIGN = (question) => `╭╼━≪• *ɢʜᴏsᴛ ᴛʀᴜᴛʜ* •≫━╾╮
┃ 
┃ ${toSmallCaps('ǫᴜᴇsᴛɪᴏɴ')} : ${question} 🤔
┃ ${toSmallCaps('ᴛʏᴘᴇ')} : ${toSmallCaps('ᴠᴇʀɪᴛᴇ')} 📝
┃ ${toSmallCaps('sᴛᴀᴛᴜs')} : ${toSmallCaps('ᴀᴛᴛᴇɴᴛᴇ')}... ⌛
┃ 
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

module.exports = {
    name: 'truth',
    aliases: ['verite', 'vrt'],
    category: 'fun',
    desc: 'Obtenir une question de vérité aléatoire',
    usage: 'truth [@user]',
    execute: async (sock, msg, args, extra) => {
      try {
        // Liste de questions locales (Rapide & Fiable)
        const localTruths = [
            "Quelle est la chose la plus folle que tu aies faite par amour ?",
            "Quel est ton plus grand secret que personne ici ne connaît ?",
            "As-tu déjà menti pour sortir d'un problème sérieux ?",
            "Qui est ton crush actuel dans ce groupe ?",
            "Quelle est ta plus grande peur inavouable ?",
            "As-tu déjà fouillé le téléphone de quelqu'un ?",
            "Quel est le dernier mensonge que tu as raconté ?",
            "Si tu pouvais être invisible une journée, que ferais-tu ?"
        ];

        let questionFr;

        try {
            // Tentative via API + Traduction
            const rawQuestion = await truth();
            const res = await translate(rawQuestion, { to: 'fr' });
            questionFr = res.text;
        } catch (e) {
            // Fallback si l'API échoue
            questionFr = localTruths[Math.floor(Math.random() * localTruths.length)];
        }

        const styledQuestion = toSmallCaps(questionFr);
        const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;
        const mentioned = ctxInfo?.mentionedJid || [];
        const chatId = extra.from;

        let finalQuestion = styledQuestion;

        // Ciblage automatique
        if (mentioned.length > 0) {
            finalQuestion = `@${mentioned[0].split('@')[0]}, ${toSmallCaps('reponds honnetement')} : ${styledQuestion}`;
        } else if (ctxInfo?.participant) {
            const target = ctxInfo.participant;
            finalQuestion = `@${target.split('@')[0]}, ${toSmallCaps('reponds honnetement')} : ${styledQuestion}`;
            if (!mentioned.includes(target)) mentioned.push(target);
        }

        // Réaction pour l'ambiance
        await sock.sendMessage(chatId, { react: { text: "🧐", key: msg.key } });

        await sock.sendMessage(chatId, {
          text: TRUTH_DESIGN(finalQuestion),
          mentions: mentioned
        }, { quoted: msg });

      } catch (error) {
        console.error('Truth Error:', error);
        await extra.reply(`❌ ${toSmallCaps('erreur systeme')}`);
      }
    }
  };
