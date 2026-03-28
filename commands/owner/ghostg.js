/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - Intel AI Controller (GhostG Core V1)
 * Role : Intelligence Artificielle de commande (NLP Exec)
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const config = require('../../config');
const toSmallCaps = (text) => {
    const fonts = {'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'s','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
    return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

const AGM_GHOSTG = (mode, status) => `*╭╼━≪• ɢʜᴏsᴛɢ ɪɴᴛᴇʟ sʏsᴛᴇᴍ •≫━╾╮*
*┃*
*┃* 🧠 *${toSmallCaps('sʏsᴛᴇᴍ')}* : ᴀɪ ᴄᴏɴᴛʀᴏʟʟᴇʀ
*┃* ⚙️ *${toSmallCaps('ᴍᴏᴅᴇ')}* : ${mode}
*┃* ✨ *${toSmallCaps('sᴛᴀᴛᴜs')}* : ${status}
*┃*
*╰━━━━━━━━━━━━━━━╯*
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

module.exports = {
  name: 'ghostg',
  aliases: ['gg', 'ai-exec'],
  category: 'owner',
  description: 'IA de contrôle des commandes du bot.',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    const { from, reply, react } = extra;
    const input = args.join(' ').toLowerCase();

    // --- 1. GESTION DES MODES (ON/OFF) ---
    if (['on private', 'on priv'].includes(input)) {
        global.ghostgMode = 'private';
        return reply(AGM_GHOSTG('🔒 ᴘʀɪᴠᴀᴛᴇ', '🟢 ᴀᴄᴛɪᴠᴀᴛᴇᴅ'));
    }
    if (['on all', 'on public'].includes(input)) {
        global.ghostgMode = 'all';
        return reply(AGM_GHOSTG('🌐 ᴘᴜʙʟɪᴄ', '🟢 ᴀᴄᴛɪᴠᴀᴛᴇᴅ'));
    }
    if (input === 'off') {
        global.ghostgMode = 'off';
        return reply(AGM_GHOSTG('⚪ ᴏғғ', '🔴 ᴅᴇᴀᴄᴛɪᴠᴀᴛᴇᴅ'));
    }

    // --- 2. LOGIQUE D'IA D'EXÉCUTION ---
    if (!args[0]) return reply(`💡 *${toSmallCaps('ᴜsᴀɢᴇ')}* : .ghostg <ordre>\n_Ex: .ghostg kick @user_`);

    await react('🧠');

    // Analyse simple des intentions (Tu peux améliorer cela avec une API IA)
    const text = args.join(' ').toLowerCase();
    let commandToExec = null;
    let newArgs = [...args];

    if (text.includes('kick') || text.includes('vire')) commandToExec = 'kick';
    else if (text.includes('add') || text.includes('ajoute')) commandToExec = 'add';
    else if (text.includes('ban') || text.includes('block')) commandToExec = 'block';
    else if (text.includes('nom') || text.includes('name')) commandToExec = 'setbotname';
    else if (text.includes('quitte') || text.includes('leave')) commandToExec = 'leave';

    if (commandToExec) {
        const cmd = global.commands.get(commandToExec) || 
                    global.commands.find(c => c.aliases && c.aliases.includes(commandToExec));

        if (cmd) {
            // Nettoyage des arguments pour ne pas passer le mot "kick" à la commande kick
            newArgs.shift(); 
            
            try {
                return await cmd.execute(sock, msg, newArgs, extra);
            } catch (e) {
                return reply(`❌ *${toSmallCaps('ᴇʀʀᴇᴜʀ ᴇxᴇᴄᴜᴛɪᴏɴ')}* : ${e.message}`);
            }
        }
    }

    return reply(`🧠 *${toSmallCaps('ɢʜᴏsᴛɢ')}* : Je n'ai pas compris cet ordre, Maître.`);
  }
};
