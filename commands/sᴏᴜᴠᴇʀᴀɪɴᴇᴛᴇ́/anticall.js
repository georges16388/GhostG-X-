/**
 * Rejet Appels Command - GhostG-X Edition
 * Active ou désactive le bouclier anti-appels en modifiant le fichier .env
 */

const fs = require('fs');
const path = require('path');
const config = require('../../config');

// Une seule définition propre du préfixe en haut
const prefix = config.prefix; 

module.exports = {
  name: 'ʀᴇᴊᴇᴛ_ᴀᴘᴘᴇʟs',
  aliases: ['rejet_appels', 'anticall', 'anti-call', 'rejeter'],
  category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
  ownerOnly: true,
  description: '*『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴀᴄᴛɪᴠᴇ ᴏᴜ ᴅᴇ́sᴀᴄᴛɪᴠᴇ ʟᴇ ʙᴏᴜᴄʟɪᴇʀ ᴀɴᴛɪ-ᴀᴘᴘᴇʟs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ*',
  usage: `${prefix}ʀᴇᴊᴇᴛ_ᴀᴘᴘᴇʟs ᴏɴ/ᴏғғ/sᴛᴀᴛᴜs`,

  async execute(sock, msg, args, extra) {
    if (!args[0]) {
      return extra.reply(`*ᴜsᴀɢᴇ : ${prefix}ʀᴇᴊᴇᴛ_ᴀᴘᴘᴇʟs ᴏɴ / ᴏғғ / sᴛᴀᴛᴜs*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
    }

    const option = args[0].toLowerCase();
    const envPath = path.join(process.cwd(), '.env');

    try {
      // Lecture du fichier .env
      let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
      
      // On cherche précisément "ANTICALL=true" dans le fichier
      const isCurrentlyEnabled = /^ANTICALL=true/m.test(envContent);

      // Traitement de l'option STATUS
      if (option === 'status') {
        const statusText = isCurrentlyEnabled 
          ? '*🛡️ ʟᴇ ʙᴏᴜᴄʟɪᴇʀ ᴀɴᴛɪ-ᴀᴘᴘᴇʟs ᴇsᴛ ᴀᴄᴛɪᴠᴇ́.*' 
          : '*🔓 ʟᴇ ʙᴏᴜᴄʟɪᴇʀ ᴀɴᴛɪ-ᴀᴘᴘᴇʟs ᴇsᴛ ᴅᴇ́sᴀᴄᴛɪᴠᴇ́.*';
        return extra.reply(`${statusText}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }

      if (!['on', 'off'].includes(option)) {
        return extra.reply(`*ᴜsᴀɢᴇ : ${prefix}ʀᴇᴊᴇᴛ_ᴀᴘᴘᴇʟs ᴏɴ / ᴏғғ / sᴛᴀᴛᴜs*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }

      const enable = option === 'on';

      // Vérification si le statut demandé est déjà le statut actuel
      if (enable === isCurrentlyEnabled) {
        return extra.reply(enable 
          ? '*🛡️ ʟᴇ ʙᴏᴜᴄʟɪᴇʀ ᴇsᴛ ᴅᴇ́ᴊᴀ̀ ᴀᴄᴛɪᴠᴇ́.*' 
          : '*🔓 ʟᴇ ʙᴏᴜᴄʟɪᴇʀ ᴇsᴛ ᴅᴇ́ᴊᴀ̀ ᴅᴇ́sᴀᴄᴛɪᴠᴇ́.*'
        );
      }

      // Modification chirurgicale de la ligne dans le .env
      const targetValue = enable ? 'true' : 'false';
      if (envContent.match(/^ANTICALL=/m)) {
        envContent = envContent.replace(/^ANTICALL=.*/m, `ANTICALL=${targetValue}`);
      } else {
        // Au cas où la ligne n'existe pas (par sécurité)
        envContent += `\nANTICALL=${targetValue}`;
      }

      // Sauvegarde du fichier
      fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');
      
      // Injection de la nouvelle valeur en mémoire vive
      config.defaultGroupSettings.anticall = enable;

      const successMessage = enable
        ? `*🛡️ ʟᴇ ʙᴏᴜᴄʟɪᴇʀ ᴀɴᴛɪ-ᴀᴘᴘᴇʟs ᴇsᴛ ᴀᴄᴛɪᴠᴇ́. ᴛᴏᴜᴛᴇ ɪɴᴛʀᴜsɪᴏɴ ᴠᴏᴄᴀʟᴇ sᴇʀᴀ ʀᴇᴊᴇᴛᴇ́ᴇ ᴇᴛ sᴄᴇʟʟᴇ́ᴇ.*`
        : `*🔓 ʟᴇ ʙᴏᴜᴄʟɪᴇʀ ᴀɴᴛɪ-ᴀᴘᴘᴇʟs ᴀ ᴇ́ᴛᴇ́ ᴅɪssɪᴘᴇ́. ʟᴇs ᴀᴘᴘᴇʟs sᴏɴᴛ ᴀ̀ ɴᴏᴜᴠᴇᴀᴜ ᴀᴜᴛᴏʀɪsᴇ́s.*`;

      await extra.reply(successMessage + `\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);

    } catch (err) {
      console.error('[anticall cmd] error:', err);
      extra.reply('*〆 ᴜɴᴇ ᴇʀʀᴇᴜʀ ᴀ ɪɴᴛᴇʀʀᴏᴍᴘᴜ ʟᴀ ᴛʀᴀɴsᴍᴜᴛᴀᴛɪᴏɴ ᴅᴜ ʙᴏᴜᴄʟɪᴇʀ.*');
    }
  }
};
