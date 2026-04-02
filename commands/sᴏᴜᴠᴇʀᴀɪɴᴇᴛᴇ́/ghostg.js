/**
 * ɢʜᴏsᴛɢ-x ᴍᴅ - Interrupteur Intelligence Artificielle
 * Version : Prestige V5.2 - Light Version (.env Synced)
 * Powered by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const fs = require('fs');
const path = require('path');
const config = require('../../config.js');

// Extraction du préfixe pour l'usage
const prefix = config.prefix;

module.exports = {
    name: 'ɢʜᴏsᴛɢ',
    aliases: ['ghostg', 'intel', 'botai'],
    category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
    ownerOnly: true,
    description: '『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴜᴛɪʟɪsᴇ ʟᴇ sʏsᴛᴇ̀ᴍᴇ ɴʟᴘ ɪɴᴛᴇʟʟɪɢᴇɴᴛ ᴘᴏᴜʀ ᴇxᴇ́ᴄᴜᴛᴇʀ ᴛᴇs ᴏʀᴅʀᴇs sᴀɴs ᴘʀᴇ́ғɪxᴇ',
    usage: `${prefix}ɢʜᴏsᴛɢ ᴏɴ/ᴏғғ`,

    async execute(sock, msg, args, extra) {
        const { reply, react } = extra;
        const firstWord = args && args[0] ? args[0].toLowerCase() : "";
        const envPath = path.join(process.cwd(), '.env');

        try {
            // 1️⃣ Lecture du fichier .env pour connaître le statut physique actuel
            let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
            
            // On vérifie si la ligne GHOSTG_MODE est sur "on"
            const isCurrentlyOn = /^GHOSTG_MODE=on/m.test(envContent);

            // Cas 1 : Activation du mode NLP
            if (firstWord === 'on') {
                if (isCurrentlyOn) {
                    return reply('*🧠 ʟᴇ sʏsᴛᴇ̀ᴍᴇ ɢʜᴏsᴛɢ ɪɴᴛᴇʟ ᴇsᴛ ᴅᴇ́ᴊᴀ̀ ᴀᴄᴛɪᴠᴇ́.*');
                }
                
                // Modification du fichier .env
                if (envContent.match(/^GHOSTG_MODE=/m)) {
                    envContent = envContent.replace(/^GHOSTG_MODE=.*/m, `GHOSTG_MODE=on`);
                } else {
                    envContent += `\nGHOSTG_MODE=on`;
                }
                fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');

                // Application en mémoire vive
                global.ghostgMode = 'on';
                config.ghostgMode = 'on';

                await react('🧠');
                return reply(`🟢 *ɢʜᴏsᴛɢ ɪɴᴛᴇʟ : ᴀᴄᴛɪᴠᴇ́. ᴊᴇ ᴛ'ᴇ́ᴄᴏᴜᴛᴇ ᴅᴇ́sᴏʀᴍᴀɪs.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
            }

            // Cas 2 : Désactivation du mode NLP
            if (firstWord === 'off') {
                if (!isCurrentlyOn) {
                    return reply('*💤 ʟᴇ sʏsᴛᴇ̀ᴍᴇ ɢʜᴏsᴛɢ ɪɴᴛᴇʟ ᴇsᴛ ᴅᴇ́ᴊᴀ̀ ᴇɴ ᴠᴇɪʟʟᴇ.*');
                }
                
                // Modification du fichier .env
                if (envContent.match(/^GHOSTG_MODE=/m)) {
                    envContent = envContent.replace(/^GHOSTG_MODE=.*/m, `GHOSTG_MODE=off`);
                } else {
                    envContent += `\nGHOSTG_MODE=off`;
                }
                fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');

                // Application en mémoire vive
                global.ghostgMode = 'off';
                config.ghostgMode = 'off';

                await react('💤');
                return reply(`💡 *ɢʜᴏsᴛɢ ɪɴᴛᴇʟ : ᴍɪs ᴇɴ ᴠᴇɪʟʟᴇ.*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
            }

            // Cas par défaut : Affichage du statut
            const modeStatus = isCurrentlyOn ? '🟢 ᴏɴ' : '🔴 ᴏғғ';
            return reply(`🤖 *ɢʜᴏsᴛɢ ᴄᴏɴᴛʀᴏʟ : ${modeStatus}*\n*ᴜsᴀɢᴇ : ${prefix}ɢʜᴏsᴛɢ ᴏɴ/ᴏғғ*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);

        } catch (err) {
            console.error('[ghostg cmd] error:', err);
            return reply('*〆 ᴜɴᴇ ᴇʀʀᴇᴜʀ ᴀ ɪɴᴛᴇʀʀᴏᴍᴘᴜ ʟᴀ ᴛʀᴀɴsᴍᴜᴛᴀᴛɪᴏɴ ᴅᴇ ʟ\'ɪɴᴛᴇʟʟɪɢᴇɴᴄᴇ.*');
        }
    }
};
