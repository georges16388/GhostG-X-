/**
 * GitHub Command - Show GhostG-X- Repository Stats
 * Custom Design by -ɢʜᴏsᴛɢ 𝐗
 */

const axios = require('axios');
const config = require('../../config');

module.exports = {
    name: 'github',
    aliases: ['repo', 'git', 'source', 'sc', 'script', 'ghost'],
    category: 'essentials',
    description: 'Affiche les statistiques du projet GhostG-X-',
    usage: '.github',
    ownerOnly: false,

    async execute(sock, msg, args, extra) {
        try {
            const chatId = extra.from;
            const repoUrl = 'https://github.com/georges16388/GhostG-X-';
            const apiUrl = 'https://api.github.com/repos/georges16388/GhostG-X-';
            
            // Réaction de chargement "Dev"
            await sock.sendMessage(chatId, { react: { text: "📂", key: msg.key } });

            try {
                // Fetch data from GitHub API
                const response = await axios.get(apiUrl, {
                    headers: { 'User-Agent': 'GhostG-X-Bot' }
                });
                
                const repo = response.data;
                
                let message = `╭╼━≪• ɢʜᴏsᴛ ʀᴇᴘᴏsɪᴛᴏʀʏ •≫━╾╮\n\n`;
                message += `🤖 *ɴᴏᴍ :* ${repo.name}\n`;
                message += `👤 *ᴀᴜᴛʜᴇᴜʀ :* @${repo.owner.login}\n`;
                message += `📄 *ᴅᴇsᴄ :* ${repo.description || 'Script Multidisciplinaire WhatsApp'}\n`;
                message += `🌐 *ᴜʀʟ :* ${repo.html_url}\n\n`;
                
                message += `📊 *sᴛᴀᴛɪsᴛɪǫᴜᴇs :*\n`;
                message += `⭐ *ᴇᴛᴏɪʟᴇs :* ${repo.stargazers_count}\n`;
                message += `🍴 *ғᴏʀᴋs :* ${repo.forks_count}\n`;
                message += `👁️ *ᴡᴀᴛᴄʜᴇʀs :* ${repo.watchers_count}\n`;
                message += `📦 *ᴛᴀɪʟʟᴇ :* ${(repo.size / 1024).toFixed(2)} MB\n\n`;
                
                message += `🛠️ *ᴄᴏᴍᴍᴀɴᴅᴇ ᴅᴇ ᴄʟᴏɴᴀɢᴇ :*\n`;
                message += `> \`git clone ${repo.clone_url}\`\n\n`;
                
                message += `╰━━━━━━━━━━━━━━━╯\n\n`;
                message += `> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`;
                
                await sock.sendMessage(chatId, {
                    text: message,
                    contextInfo: {
                        externalAdReply: {
                            title: "GHOSTG-X- OFFICIAL SOURCE",
                            body: "The next generation WhatsApp Bot",
                            mediaType: 1,
                            thumbnailUrl: repo.owner.avatar_url,
                            sourceUrl: repoUrl,
                            renderLargerThumbnail: true
                        }
                    }
                }, { quoted: msg });

                await sock.sendMessage(chatId, { react: { text: "✅", key: msg.key } });
                
            } catch (apiError) {
                // Fallback si l'API GitHub est fatiguée
                let fallbackMessage = `╭╼━≪• ɢʜᴏsᴛ ʀᴇᴘᴏsɪᴛᴏʀʏ •≫━╾╮\n\n`;
                fallbackMessage += `🤖 *ɴᴏᴍ :* GhostG-X-\n`;
                fallbackMessage += `👤 *ᴀᴜᴛʜᴇᴜʀ :* georges16388\n`;
                fallbackMessage += `🌐 *ᴜʀʟ :* ${repoUrl}\n\n`;
                fallbackMessage += `⚠️ *Note :* Stats indisponibles actuellement.\n\n`;
                fallbackMessage += `╰━━━━━━━━━━━━━━━╯\n\n`;
                fallbackMessage += `> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`;
                
                await extra.reply(fallbackMessage);
            }
            
        } catch (error) {
            console.error('GitHub Error:', error);
            await extra.reply(`❌ Erreur système : ${error.message}`);
        }
    }
};
