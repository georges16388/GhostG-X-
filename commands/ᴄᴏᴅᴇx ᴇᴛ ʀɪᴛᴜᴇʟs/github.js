const axios = require('axios');
const config = require('../../config.js');

module.exports = {
    name: 'ғᴏʀɢᴇ',
    // Ajout de 'github', 'repo', 'source', 'sc', 'script' et 'forge' en texte brut pour assurer la réactivité !
    aliases: ['repo', 'git', 'source', 'sc', 'script', 'github', 'forge', 'r'],
    category: '☬ᴄᴏᴅᴇx ᴇᴛ ʀɪᴛᴜᴇʟs',
    description: '**ᴀꜰꜰɪᴄʜᴇ ʟᴇ ᴅᴇ́ᴘᴏ̂ᴛ ɢɪᴛʜᴜʙ ᴅᴜ ʙᴏᴛ ᴇᴛ ꜱᴇꜱ ꜱᴛᴀᴛɪꜱᴛɪQᴜᴇꜱ**',
    usage: 'ғᴏʀɢᴇ',
    ownerOnly: false,

    async execute(sock, msg, args, extra) {
        try {
            const chatId = extra.from;

            // GitHub repository URL
            const repoUrl = 'https://github.com/georges16388/GhostG-X-';
            // Correction de l'URL pour pointer vers l'API officielle de GitHub
            const apiUrl = 'https://api.github.com/repos/georges16388/GhostG-X-';

            // Send loading message
            const loadingMsg = await extra.reply('🔍 *ɪɴᴠᴏᴄᴀᴛɪᴏɴ ᴅᴇs ᴅᴏɴɴᴇ́ᴇs ᴅᴇ ʟᴀ ғᴏʀɢᴇ...*');

            try {
                // Fetch repository data from GitHub API
                const response = await axios.get(apiUrl, {
                    headers: {
                        'User-Agent': 'GhostG-X'
                    }
                });

                const repo = response.data;

                // Format the response with proper styling
                let message = `╭╼━━━━━━━━━━━━━━━╾╮\n` +
                              `┃     🔮 *ʟᴀ ғᴏʀɢᴇ ɢɪᴛʜᴜʙ* ┃\n` +
                              `╰╼━━━━━━━━━━━━━━━╾╯\n\n` +
                              `🤖 *ʙᴏᴛ :* ${config.botName || 'GhostG-𝐗'}\n` +
                              `🔗 *ʀᴇᴘᴏsɪᴛᴏʀʏ :* ${repo.name}\n` +
                              `👨‍💻 *ᴍᴀɪ̂ᴛʀᴇ ᴅᴇ ғᴏʀɢᴇ :* ɢᴇᴏʀɢᴇs\n` +
                              `📄 *ᴅᴇsᴄʀɪᴘᴛɪᴏɴ :* ${repo.description || 'ᴀᴜᴄᴜɴᴇ ᴅᴇsᴄʀɪᴘᴛɪᴏɴ'}\n` +
                              `🌐 *ᴜʀʟ :* ${repo.html_url}\n\n` +

                              `📊 *sᴛᴀᴛɪsᴛɪǫᴜᴇs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ*\n` +
                              `⭐ *ᴇ́ᴛᴏɪʟᴇs :* ${repo.stargazers_count.toLocaleString()}\n` +
                              `🍴 *ғᴏʀᴋs :* ${repo.forks_count.toLocaleString()}\n` +
                              `👁️ *ᴠɪsɪᴛᴇᴜʀs :* ${repo.watchers_count.toLocaleString()}\n` +
                              `📦 *ᴛᴀɪʟʟᴇ :* ${(repo.size / 1024).toFixed(2)} MB\n\n` +

                              `🔗 *ʟɪᴇɴs sᴘᴇ́ᴄɪᴀᴜx*\n` +
                              `⭐ Star: ${repo.html_url}/stargazers\n` +
                              `🍴 Fork: ${repo.html_url}/fork\n` +
                              `📥 Clone: git clone ${repo.clone_url}\n\n` +
                              `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

                const messageKey = loadingMsg?.key || loadingMsg;

                // Edit the loading message with the actual data
                await sock.sendMessage(chatId, {
                    text: message,
                    edit: messageKey
                });

            } catch (apiError) {
                // Fallback message if API fails
                console.error('GitHub API Error:', apiError.message);

                let fallbackMessage = `╭╼━━━━━━━━━━━━━━━╾╮\n` +
                                      `┃     🔮 *ʟᴀ ғᴏʀɢᴇ ɢɪᴛʜᴜʙ* ┃\n` +
                                      `╰╼━━━━━━━━━━━━━━━╾╯\n\n` +
                                      `🤖 *ʙᴏᴛ :* ${config.botName || 'GhostG-𝐗'}\n` +
                                      `🔗 *ʀᴇᴘᴏsɪᴛᴏʀʏ :* GhostG-X-\n` +
                                      `👨‍💻 *ᴍᴀɪ̂ᴛʀᴇ ᴅᴇ ғᴏʀɢᴇ :* ɢᴇᴏʀɢᴇs\n` +
                                      `🌐 *ᴜʀʟ :* ${repoUrl}\n\n` +
                                      `⚠️ *ɴᴏᴛᴇ :* ɪᴍᴘᴏssɪʙʟᴇ ᴅᴇ ʀᴇᴄᴜᴘᴇ́ʀᴇʀ ʟᴇs sᴛᴀᴛɪsᴛɪǫᴜᴇs ᴇɴ ᴛᴇᴍᴘs ʀᴇ́ᴇʟ.\n` +
                                      `ᴠᴇᴜɪʟʟᴇᴢ ᴠɪsɪᴛᴇʀ ʟᴀ ғᴏʀɢᴇ ᴅɪʀᴇᴄᴛᴇᴍᴇɴᴛ ᴘᴏᴜʀ ᴠᴏɪʀ ʟ'ᴇ́ᴠᴏʟᴜᴛɪᴏɴ.\n\n` +
                                      `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

                const messageKey = loadingMsg?.key || loadingMsg;

                await sock.sendMessage(chatId, {
                    text: fallbackMessage,
                    edit: messageKey
                });
            }

        } catch (error) {
            console.error('GitHub command error:', error);
            await extra.reply(`❌ *ᴇʀʀᴇᴜʀ :* ${error.message} \n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
        }
    }
};
