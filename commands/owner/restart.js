/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - Restart System Core
 * Dynamic Reboot Engine (PM2 & Process Fallback)
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const { exec } = require('child_process');

const toSmallCaps = (text) => {
    const fonts = {'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'s','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
    return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

const AGM_RESTART_DESIGN = (time) => `*╭╼━≪• ʀᴇsᴛᴀʀᴛ sʏsᴛᴇᴍ •≫━╾╮*
*┃*
*┃* ⚙️ *${toSmallCaps('sᴛᴀᴛᴜs')}* : 🔄 ʀᴇʙᴏᴏᴛɪɴɢ
*┃* 🌐 *${toSmallCaps('sᴄᴏᴘᴇ')}* : ᴀʟʟ ᴍᴏᴅᴜʟᴇs
*┃* ⏰ *${toSmallCaps('ᴛɪᴍᴇ')}* : *${time}*
*┃*
*╰━━━━━━━━━━━━━━━╯*
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

module.exports = {
  name: 'restart',
  aliases: ['reboot', 'reset'],
  category: 'owner',
  description: 'Redémarrer le bot proprement',
  ownerOnly: true,

  async execute(sock, msg, args, { reply, react }) {
    try {
      const time = new Date().toLocaleTimeString('fr-FR', { timeZone: 'Africa/Ouagadougou' });
      
      await react('🔄');
      await reply(AGM_RESTART_DESIGN(time));

      // Petit délai pour s'assurer que le message WhatsApp est bien parti
      setTimeout(() => {
        // Tentative de redémarrage PM2 (Silencieuse)
        exec('pm2 restart all', (err) => {
          if (err) {
            // Si PM2 n'est pas là, on force la sortie pour que Nodemon ou Docker relance
            console.log('[SYSTEM]: PM2 not found, using process.exit(0)');
            process.exit(0);
          }
        });
      }, 1500);

    } catch (error) {
      console.error('[RESTART ERROR]:', error);
      reply(`❌ *${toSmallCaps("erreur lors du redemarrage")}*`);
    }
  }
};
