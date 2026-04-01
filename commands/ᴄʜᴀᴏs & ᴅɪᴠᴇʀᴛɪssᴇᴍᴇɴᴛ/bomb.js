/**
 * Bomb Game - Interactive number guessing game
 * GhostG-X Edition
 */

const config = require('../../config.js');

const gameState = new Map();

// Fonction pour le style Small Caps (Cohérence visuelle du sanctuaire)
function toSmallCaps(text) {
  const normal = "abcdefghijklmnopqrstuvwxyz0123456789";
  const smallCaps = "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ0123456789";

  const cleanedText = text.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); 

  return cleanedText.split('').map(c => {
    const index = normal.indexOf(c);
    return index !== -1 ? smallCaps[index] : c;
  }).join('');
}

const prefix = config.prefix || '.';

module.exports = {
  gameState,
  name: 'piege',
  aliases: ['bom', 'bombe', 'chaos', 'bomb', 'piege'],
  category: '♞ ᴄʜᴀᴏs & ᴅɪᴠᴇʀᴛɪssᴇᴍᴇɴᴛ',
  description: '**『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴅᴇғɪᴇ ʟᴇ ᴅᴇsᴛɪɴ : ᴄʜᴏɪsɪs ʟᴇs ʙᴏɴs sᴄᴇᴀᴜx ᴇᴛ ᴇᴠɪᴛᴇ ʟᴀ ʙᴏᴍʙᴇ**',
  usage: `${prefix}piege`,

  async execute(sock, msg, args, extra) {
    const { reply } = extra;
    const sender = extra.sender;
    const from = extra.from;
    const timeout = 180000; // 3 minutes

    try {
      // 1️⃣ VÉRIFICATION D'UNE SESSION ACTIVE
      if (gameState.has(sender)) {
        const game = gameState.get(sender);
        const text = msg.message?.conversation || 
                     msg.message?.extendedTextMessage?.text || 
                     '';

        // Option d'abandon
        if (['suren', 'abandon', 'surrender'].includes(text.toLowerCase().trim())) {
          const bombBox = game.array.find(v => v.emot === '💥');
          await reply(
            `*〆 ${toSmallCaps('tu as abandonne le defi')} !* 💣\n\n` +
            `*${toSmallCaps('la bombe etait dissimulee dans le sceau numero')} ${bombBox.number}.*\n\n` +
            `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ 𝐗*`, { quoted: game.msg }
          );
          clearTimeout(game.timeoutId);
          gameState.delete(sender);
          return;
        }

        const number = parseInt(text.trim());
        if (isNaN(number) || number < 1 || number > 9) return;

        const selectedBox = game.array.find(v => v.position === number);
        if (!selectedBox || selectedBox.state) return;

        selectedBox.state = true;

        // CAS : EXPLOSION
        if (selectedBox.emot === '💥') {
          let teks = `*💥 ${toSmallCaps('la bombe a explose')} !*\n\n` +
                     `*${toSmallCaps('tu as brise le sceau')} ${selectedBox.number} ${toSmallCaps('et')}...*\n\n` +
                     `*💣 ʙᴏᴏᴏᴏᴏᴍ ! 💣*\n\n` +
                     `*${toSmallCaps('echec du defi. tes points sont dissipes')}.*\n\n` +
                     `*🔮 ʀᴇ́ᴠᴇ́ʟᴀᴛɪᴏɴ ғɪɴᴀʟᴇ :*\n`;

          for (let i = 0; i < game.array.length; i += 3) {
            teks += game.array.slice(i, i + 3).map(v => v.emot).join('') + '\n';
          }
          teks += `\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ 𝐗*`;

          await sock.sendMessage(from, { text: teks }, { quoted: game.msg });
          clearTimeout(game.timeoutId);
          gameState.delete(sender);
          return;
        }

        // CAS : VICTOIRE
        const safeBoxes = game.array.filter(v => v.emot === '✅');
        const openedSafeBoxes = safeBoxes.filter(v => v.state);

        if (openedSafeBoxes.length === safeBoxes.length) {
          let teks = `*🎉 ${toSmallCaps('victoire eclatante')} !*\n\n` +
                     `*${toSmallCaps('incroyable ! tu as dejoue le piege et ouvert tous les sceaux sains')}.*\n\n` +
                     `*🏆 ${toSmallCaps('tableau de guerre')} :*\n`;

          for (let i = 0; i < game.array.length; i += 3) {
            teks += game.array.slice(i, i + 3).map(v => v.emot).join('') + '\n';
          }
          teks += `\n*✅ ${toSmallCaps('tes points ont ete augmentes')}.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ 𝐗*`;

          await sock.sendMessage(from, { text: teks }, { quoted: game.msg });
          clearTimeout(game.timeoutId);
          gameState.delete(sender);
          return;
        }

        // MISE À JOUR DU PLATEAU
        let teks = `╭╼━━━≪• *${toSmallCaps('le defi de la bombe')}* •≫━━━╾╮\n` +
                   `┃ *sᴄᴇᴀᴜ ${selectedBox.number} ᴏᴜᴠᴇʀᴛ :* ${selectedBox.emot}\n` +
                   `┃ *${toSmallCaps('envoie un chiffre')} (1-9) :*\n` +
                   `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`;

        for (let i = 0; i < game.array.length; i += 3) {
          teks += game.array.slice(i, i + 3).map(v => v.state ? v.emot : v.number).join('') + '\n';
        }
        teks += `\n*⏳ ${toSmallCaps('sablier')} : [ 3 ${toSmallCaps('minutes')} ]*\n` +
                `*${toSmallCaps('tape suren pour abandonner')}.*\n\n` +
                `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ 𝐗*`;

        await sock.sendMessage(from, { text: teks }, { quoted: game.msg });
        return;
      }

      // 2️⃣ INITIALISATION DU NOUVEAU JEU
      const bom = ['💥', '✅', '✅', '✅', '✅', '✅', '✅', '✅', '✅'].sort(() => Math.random() - 0.5);
      const number = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
      const array = bom.map((v, i) => ({
        emot: v,
        number: number[i],
        position: i + 1,
        state: false
      }));

      let teks = `╭╼━━━≪• *${toSmallCaps('le defi de la bombe')}* •≫━━━╾╮\n` +
                 `┃ *${toSmallCaps('envoie un chiffre entre 1 et 9 pour')}*\n` +
                 `┃ *${toSmallCaps('tenter d\'ouvrir les sceaux sains')}.*\n` +
                 `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`;

      for (let i = 0; i < array.length; i += 3) {
        teks += array.slice(i, i + 3).map(v => v.state ? v.emot : v.number).join('') + '\n';
      }
      teks += `\n*⏳ ${toSmallCaps('temps disponible')} : [ 3 ${toSmallCaps('minutes')} ]*\n` +
              `*${toSmallCaps('evite la bombe ou tes points seront reduits')}.*\n\n` +
              `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ 𝐗*`;

      const gameMsg = await sock.sendMessage(from, {
        text: teks,
        contextInfo: {
          externalAdReply: {
            title: "ɢʜᴏsᴛɢ-x : ᴄʜᴀᴏs ɢᴀᴍᴇ",
            body: `${toSmallCaps('evite la bombe pour survivre')} !`,
            thumbnailUrl: "https://telegra.ph/file/b3138928493e78b55526f.jpg",
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: msg });

      // Gestion de la fin du temps imparti
      const timeoutId = setTimeout(() => {
        if (gameState.has(sender)) {
          const game = gameState.get(sender);
          const bombBox = game.array.find(v => v.emot === '💥');
          sock.sendMessage(from, {
            text: `*⏳ ${toSmallCaps('le sablier est vide')} !*\n\n*${toSmallCaps('la bombe s\'est activee dans le sceau')} ${bombBox.number}.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ 𝐗*`
          }, { quoted: game.msg });
          gameState.delete(sender);
        }
      }, timeout);

      gameState.set(sender, { msg: gameMsg, array, timeoutId });

    } catch (error) {
      console.error('Bomb Game Error:', error);
      await reply(`*〆 ${toSmallCaps('une erreur s\'est produite dans le chaos')} : ${error.message}*`);
    }
  }
};
