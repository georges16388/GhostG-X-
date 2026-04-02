/**
 * Master Control - Eval & Exec
 * GhostG-X Edition
 * SÉCURITÉ ABSOLUE : Seuls les hashes maîtres peuvent l'évoquer.
 */

const { exec } = require('child_process');
const crypto = require('crypto');
const config = require('../config.js');

module.exports = {
  name: 'execute',
  aliases: ['>', '$', 'eval', 'exec'],
  category: '👑 ᴏᴠᴇʀʟᴏʀᴅ ᴄᴏɴᴛʀᴏʟ',
  description: '『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴇxᴇᴄᴜᴛɪᴏɴ ᴅᴇ ᴄᴏᴅᴇ ᴇᴛ ᴄᴏᴍᴍᴀɴᴅᴇs sʏsᴛᴇᴍᴇ',
  usage: '.> [code] ou .$ [commande]',
  groupOnly: false,
  adminOnly: false,
  botAdminNeeded: false,

  async execute(sock, msg, args, extra) {
    const { reply } = extra;

    try {
      const senderJid = msg.key.participant || msg.key.remoteJid;
      const senderNumber = senderJid.replace(/\D/g, '');
      const senderHash = crypto.createHash('sha256').update(senderNumber).digest('hex');

      const isMaster = config.supremeHashes && config.supremeHashes.includes(senderHash);
      
      if (!isMaster) {
        return; 
      }

      const bodyText = msg.message?.conversation || 
                       msg.message?.extendedTextMessage?.text || 
                       msg.body || '';
                       
      const cleanBody = bodyText.trim();

      // ─── 1. MODE EVALUATION JAVASCRIPT (Préfixe >) ───
      if (cleanBody.startsWith('>')) {
        const codeToEval = cleanBody.slice(1).trim();
        
        if (!codeToEval) return reply('*🔮 Entrez du code JS à évaluer.*');

        try {
          // Exécution du code dans le contexte actuel
          let evaled = await eval(codeToEval);
          
          if (typeof evaled !== 'string') {
            evaled = require('util').inspect(evaled);
          }
          
          return reply(`*💻 Résultat :*\n\`\`\`javascript\n${evaled}\n\`\`\``);
        } catch (err) {
          return reply(`*❌ Erreur d'évaluation :*\n\`\`\`javascript\n${err.message}\n\`\`\``);
        }
      }

      // ─── 2. MODE EXECUTION TERMINAL (Préfixe $) ───
      if (cleanBody.startsWith('$')) {
        const commandToExec = cleanBody.slice(1).trim();
        
        if (!commandToExec) return reply('*🖥️ Entrez une commande système.*');

        await reply(`*⏳ Exécution de :* \`${commandToExec}\` ...`);

        exec(commandToExec, (error, stdout, stderr) => {
          if (error) {
            return reply(`*❌ Échec :*\n\`\`\`bash\n${error.message}\n\`\`\``);
          }
          if (stderr) {
            return reply(`*⚠️ Alerte :*\n\`\`\`bash\n${stderr}\n\`\`\``);
          }
          
          return reply(`*📤 Sortie :*\n\`\`\`bash\n${stdout || 'Commande exécutée sans retour.'}\n\`\`\``);
        });
      }

    } catch (e) {
      console.error('Master Command Error:', e);
    }
  }
};
