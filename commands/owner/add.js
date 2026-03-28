/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - Group Member Adder (AGM Admin Core)
 * Role : Ajouter un membre via son numéro
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const toSmallCaps = (text) => {
    const fonts = {'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'s','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
    return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

const AGM_ADD_DESIGN = (num, status) => `*╭╼━≪• ᴀɢᴍ ɢʀᴏᴜᴘ sʏsᴛᴇᴍ •≫━╾╮*
*┃*
*┃* 👤 *${toSmallCaps('ᴛᴀʀɢᴇᴛ')}* : ${num}
*┃* ✨ *${toSmallCaps('ᴀᴄᴛɪᴏɴ')}* : ᴀᴅᴅ ᴍᴇᴍʙᴇʀ
*┃* ✅ *${toSmallCaps('sᴛᴀᴛᴜs')}* : ${status}
*┃*
*╰━━━━━━━━━━━━━━━╯*
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

module.exports = {
  name: 'add',
  aliases: ['ajouter', 'invite'],
  category: 'owner',
  description: 'Ajouter un membre à un groupe.',
  usage: '.add 226XXXXXXXX',
  ownerOnly: true,
  groupOnly: true, // Cette commande ne marche que dans les groupes

  async execute(sock, msg, args, { from, reply, react }) {
    try {
      // 1. VÉRIFICATION DES PERMISSIONS DU BOT
      const metadata = await sock.groupMetadata(from);
      const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
      const isBotAdmin = metadata.participants.find(p => p.id === botId)?.admin;

      if (!isBotAdmin) {
        return reply(`❌ *${toSmallCaps("erreur : le bot doit être admin pour ajouter des membres")}*`);
      }

      // 2. EXTRACTION ET NETTOYAGE DU NUMÉRO
      let input = args.join(' ').replace(/[^0-9]/g, '');
      
      if (!input || input.length < 8) {
        return reply(`💡 *${toSmallCaps("usage")}* : .add 226xxxxxxxx`);
      }

      const jid = input + '@s.whatsapp.net';

      await react('➕');

      // 3. TENTATIVE D'AJOUT
      const response = await sock.groupParticipantsUpdate(from, [jid], "add");

      /**
       * Note sur la réponse Baileys :
       * status 200 = Succès
       * status 403 = L'utilisateur a activé la protection (Privé) -> Invitation envoyée
       * status 408 = L'utilisateur vient de quitter le groupe
       */
      
      let statusText = "sᴜᴄᴄᴇss";
      if (response[0].status === "403") {
          statusText = "ɪɴᴠɪᴛᴇ sᴇɴᴛ (ᴘʀɪᴠᴀᴛᴇ)";
      } else if (response[0].status === "408") {
          statusText = "ғᴀɪʟᴇᴅ (ʀᴇᴄᴇɴᴛʟʏ ʟᴇғᴛ)";
      } else if (response[0].status === "409") {
          statusText = "ᴀʟʀᴇᴀᴅʏ ɪɴ ɢʀᴏᴜᴘ";
      }

      await react('✅');
      return reply(AGM_ADD_DESIGN(input, statusText));

    } catch (error) {
      console.error('[ADD ERROR]:', error);
      reply(`❌ *${toSmallCaps("erreur")}* : ${error.message}`);
    }
  }
};
