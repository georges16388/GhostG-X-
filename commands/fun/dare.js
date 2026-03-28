/**
 * Dare - Get a random dare challenge
 * Custom Design by -ɢʜᴏsᴛɢ 𝐗
 */

// Design pour le défi (Action)
const DARE_DESIGN = (challenge) => `╭╼━≪• *ɢʜᴏsᴛ ᴅᴀʀᴇ* •≫━╾╮
┃ *ᴅᴇғɪ* : ${challenge}
┃ *ᴛʏᴘᴇ* : ᴀᴄᴛɪᴏɴ 🔥
┃ *sᴛᴀᴛᴜs* : ᴘᴇɴᴅɪɴɢ... ⏳
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

module.exports = {
    name: 'dare',
    aliases: ['action', 'defi'],
    category: 'fun',
    desc: 'Get a random dare challenge',
    usage: 'dare [@user]',
    execute: async (sock, msg, args, extra) => {
      try {
        const dares = [
          "Envoie une capture d'écran de ta galerie ! 📸",
          "Laisse quelqu'un d'autre écrire ton statut WhatsApp ! ✍️",
          "Appelle un contact au hasard et chante-lui une chanson ! 🎤",
          "Poste un selfie embarrassant ! 🤳",
          "Envoie un message à ton crush et confesse tes sentiments ! ❤️",
          "Fais 20 pompes et envoie la vidéo ! 💪",
          "Change ta photo de profil par un truc moche pendant 24h ! 🤡",
          "Envoie une note vocale en chantant l'alphabet ! 🎶",
          "Laisse le groupe choisir ton statut pour la journée ! 📝",
          "Raconte au groupe ton moment le plus embarrassant ! 😳",
          "Partage tes 5 dernières recherches Google ! 🔍",
          "Danse devant tout le monde pendant 1 minute ! 💃",
          "Imite quelqu'un du groupe du mieux que tu peux ! 🎭",
          "Parle avec un accent bizarre pendant les 10 prochaines minutes ! 🗣️",
          "Poste une story disant 'J'ai perdu un pari' pendant 24h ! 📉",
          "Laisse quelqu'un fouiller ton téléphone pendant 2 minutes ! 📱",
          "Envoie un message dragueur à un contact au hasard ! 😏",
          "Fais 50 jumping jacks (sauts écarts) ! 🏃",
          "Raconte une blague, si personne ne rit, recommence un défi ! 😂",
          "Enregistre-toi en faisant une danse TikTok ! 🕺"
        ];
        
        const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;
        const mentioned = ctxInfo?.mentionedJid || [];
        const randomDare = dares[Math.floor(Math.random() * dares.length)];
        
        const chatId = msg.key.remoteJid;
        let finalChallenge = randomDare;

        // Ciblage automatique de la personne mentionnée ou de la réponse
        if (mentioned.length > 0) {
            finalChallenge = `@${mentioned[0].split('@')[0]}, ton défi est : ${randomDare}`;
        } else if (ctxInfo?.participant) {
            finalChallenge = `@${ctxInfo.participant.split('@')[0]}, ton défi est : ${randomDare}`;
            mentioned.push(ctxInfo.participant);
        }

        await sock.sendMessage(chatId, {
          text: DARE_DESIGN(finalChallenge),
          mentions: mentioned.length > 0 ? mentioned : []
        }, { quoted: msg });
        
      } catch (error) {
        console.error('Dare Error:', error);
        await sock.sendMessage(msg.key.remoteJid, {
          text: `❌ Error: ${error.message}`
        }, { quoted: msg });
      }
    }
  };
