/**
 * Forge/GitHub Command - Display bot repository and stats
 * GhostG-X Edition
 */

const axios = require('axios');
const config = require('../../config.js');

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

module.exports = {
    name: 'forge',
    aliases: ['repo', 'git', 'source', 'sc', 'script', 'github', 'r'],
    category: '☬ ᴄᴏᴅᴇx ᴇᴛ ʀɪᴛᴜᴇʟs',
    description: '『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴀғғɪᴄʜᴇ ʟᴇ ᴅᴇᴘᴏᴛ ɢɪᴛʜᴜʙ ᴅᴜ ʙᴏᴛ ᴇᴛ sᴇs sᴛᴀᴛɪsᴛɪǫᴜᴇs',
    usage: `${config.prefix || '.'}forge`,
    groupOnly: false,
    adminOnly: false,
    botAdminNeeded: false,

    async execute(sock, msg, args, extra) {
        const { reply } = extra;
        const chatId = extra.from;

        try {
            // URL du dépôt GitHub
            const repoUrl = 'https://github.com/georges16388/GhostG-X-';
            const apiUrl = 'https://api.github.com/repos/georges16388/GhostG-X-';

            // 1. Message de chargement initial
            const loadingMsg = await reply(`*☬ ${toSmallCaps('invocation des donnees de la forge')}...*`);

            try {
                // Récupération des données depuis l'API de GitHub
                const response = await axios.get(apiUrl, {
                    headers: { 'User-Agent': 'GhostG-X' }
                });

                const repo = response.data;

                // 2. Formatage du message
                let message = `*╭╼━━━≪• ᴘᴀʟᴍᴀʀᴇ̀s ᴅᴜ ᴊᴏᴜʀ •≫━━━╾╮*\n` +
                              `*┃* 🤖 *${toSmallCaps('bot')} :* ${config.botName || 'GhostG-𝐗'}\n` +
                              `*┃* 🔗 *${toSmallCaps('repository')} :* ${repo.name}\n` +
                              `*┃* 👨‍💻 *${toSmallCaps('maitre de forge')} :* ɢᴇᴏʀɢᴇs\n` +
                              `*┃* 📄 *${toSmallCaps('description')} :* ${repo.description || toSmallCaps('aucune description')}\n` +
                              `*┃* 🌐 *${toSmallCaps('url')} :* ${repo.html_url}\n\n` +

                              `*📊 ${toSmallCaps('statistiques du sanctuaire')}*\n` +
                              `*┃* ⭐ *${toSmallCaps('etoiles')} :* ${repo.stargazers_count.toLocaleString()}\n` +
                              `*┃* 🍴 *${toSmallCaps('forks')} :* ${repo.forks_count.toLocaleString()}\n` +
                              `*┃* 👁️ *${toSmallCaps('visiteurs')} :* ${repo.watchers_count.toLocaleString()}\n` +
                              `*┃* 📦 *${toSmallCaps('taille')} :* ${(repo.size / 1024).toFixed(2)} MB\n\n` +

                              `*🔗 ${toSmallCaps('liens speciaux')}*\n` +
                              `*┃* ⭐ Star: ${repo.html_url}/stargazers\n` +
                              `*┃* 🍴 Fork: ${repo.html_url}/fork\n` +
                              `*┃* 📥 Clone: git clone ${repo.clone_url}\n\n` +
                              `_👑 ${toSmallCaps('jesus est roi')}_\n\n` +
                              `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`;

                const messageKey = loadingMsg?.key || loadingMsg;

                // 3. Altération et édition dynamique du message
                if (messageKey && typeof messageKey === 'object') {
                    await sock.sendMessage(chatId, {
                        text: message,
                        edit: messageKey
                    });
                } else {
                    await reply(message);
                }

            } catch (apiError) {
                console.error('GitHub API Error:', apiError.message);

                // Message de secours si l'API de GitHub ne répond pas
                let fallbackMessage = `*╭╼━━━≪• ᴘᴀʟᴍᴀʀᴇ̀s ᴅᴜ ᴊᴏᴜʀ •≫━━━╾╮*\n` +
                                      `*┃* 🤖 *${toSmallCaps('bot')} :* ${config.botName || 'GhostG-𝐗'}\n` +
                                      `*┃* 🔗 *${toSmallCaps('repository')} :* GhostG-X-\n` +
                                      `*┃* 👨‍💻 *${toSmallCaps('maitre de forge')} :* ɢᴇᴏʀɢᴇs\n` +
                                      `*┃* 🌐 *${toSmallCaps('url')} :* ${repoUrl}\n\n` +
                                      `*⚠️ ${toSmallCaps('note')} :* ${toSmallCaps('impossible de recuperer les statistiques en temps reel')}.\n` +
                                      `${toSmallCaps('veuillez visiter la forge directement pour voir l\'evolution')}.\n\n` +
                                      `_👑 ${toSmallCaps('jesus est roi')}_\n\n` +
                                      `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`;

                const messageKey = loadingMsg?.key || loadingMsg;

                if (messageKey && typeof messageKey === 'object') {
                    await sock.sendMessage(chatId, {
                        text: fallbackMessage,
                        edit: messageKey
                    });
                } else {
                    await reply(fallbackMessage);
                }
            }

        } catch (error) {
            console.error('GitHub command error:', error);
            await reply(`*❌ ${toSmallCaps('erreur')} :* ${error.message}\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
        }
    }
};
