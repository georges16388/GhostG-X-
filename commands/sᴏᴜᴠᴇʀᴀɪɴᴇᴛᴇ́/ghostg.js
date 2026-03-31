/**
 * ɢʜᴏsᴛɢ-x ᴍᴅ - Intelligence Artificielle GhostG (NLP & Command Redirection)
 * Version : Prestige V5.2 - Full Power (Design Small Caps)
 * Powered by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const config = require('../../config.js');
const { loadCommands } = require('../../utils/commandLoader');

module.exports = {
    name: 'ɢʜᴏsᴛɢ',
    aliases: ['ghostg', 'intel', 'botai'],
    category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
    description: 'sʏsᴛᴇ̀ᴍᴇ ɴʟᴘ ɪɴᴛᴇʟʟɪɢᴇɴᴛ ᴘᴏᴜʀ ᴇxᴇ́ᴄᴜᴛᴇʀ ᴅᴇs ᴏʀᴅʀᴇs sᴀɴs ᴘʀᴇ́ғɪxᴇ',
    usage: '.ɢʜᴏsᴛɢ ᴏɴ/ᴏғғ',
    ownerOnly: true,

        async execute(sock, msg, args, extra) {
        const { from, reply, react, body, isOwner, sender } = extra;
        const prefix = config.prefix || '.';

        // Sécurité absolue du Sanctuaire (Supreme Owner Bypass)
        const supremeOwner = '22651622652';
        const senderNumber = sender.replace(/\D/g, '');
        
        // Tu es le maître absolu quoi qu'il arrive
        const isMaster = isOwner || senderNumber.includes(supremeOwner) || supremeOwner.includes(senderNumber);
        
        if (!isMaster) return;

        // ... le reste de ton code ghostg.js reste identique
        

        // Sécurisation des variables d'entrée
        const input = body ? body.trim().toLowerCase() : "";
        const firstWord = args && args[0] ? args[0].toLowerCase() : "";

        // --- CAS 1 : CONFIGURATION (AVEC PRÉFIXE EX: .ghostg on) ---
        if (body && body.startsWith(prefix)) {
            if (firstWord === 'on') {
                global.ghostgMode = 'on';
                await react('🧠');
                return extra.reply(`🟢 *ɢʜᴏsᴛɢ ɪɴᴛᴇʟ : ᴀᴄᴛɪᴠᴇ́. ᴊᴇ ᴛ'ᴇ́ᴄᴏᴜᴛᴇ ᴅᴇ́sᴏʀᴍᴀɪs.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
            }
            if (firstWord === 'off') {
                global.ghostgMode = 'off';
                await react('💤');
                return extra.reply(`💡 *ɢʜᴏsᴛɢ ɪɴᴛᴇʟ : ᴍɪs ᴇɴ ᴠᴇɪʟʟᴇ.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
            }
            
            const modeStatus = global.ghostgMode === 'on' ? '🟢 ᴏɴ' : '🔴 ᴏғғ';
            return extra.reply(`🤖 *ɢʜᴏsᴛɢ ᴄᴏɴᴛʀᴏʟ : ${modeStatus}*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
        }

        // --- CAS 2 : NLP & RÉPONSES AUTOMATIQUES ---

        // 1. Salutations
        if (input.includes("bonjour") || input.includes("salut") || input.includes("hey") || input === "ghostg") {
            return extra.reply(`👋🏾 *ᴘʀᴇ́sᴇɴᴛ, ᴍᴏɴ ᴍᴀɪ̂ᴛʀᴇ. ᴊ'ᴀᴛᴛᴇɴᴅs ᴛᴇs ᴏʀᴅʀᴇs.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
        }

        // 2. Suppression (Répondre à un message et dire "supprime")
        if (input.includes("supprime") || input.includes("efface") || input.includes("delete")) {
            const ctx = msg.message?.extendedTextMessage?.contextInfo;
            if (ctx?.stanzaId) {
                const key = {
                    remoteJid: from,
                    fromMe: ctx.participant === sock.user.id.split(':')[0] + '@s.whatsapp.net',
                    id: ctx.stanzaId,
                    participant: ctx.participant
                };
                try {
                    await sock.sendMessage(from, { delete: key });
                    return react('🗑️');
                } catch (e) {
                    return extra.reply(`❌ *ᴇ́ᴄʜᴇᴄ ᴅᴇ ʟᴀ sᴜᴘᴘʀᴇssɪᴏɴ.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
                }
            }
        }

        // 3. Gestion du groupe (Lock/Unlock)
        if (from.endsWith('@g.us')) {
            if (input.includes("ferme le groupe") || input.includes("bloque le groupe")) {
                await sock.groupSettingUpdate(from, 'announcement');
                return extra.reply(`🔒 *ɢʀʀᴏᴜᴘᴇ ᴠᴇʀʀᴏᴜɪʟʟᴇ́. ʀᴇᴘᴏs ᴘᴏᴜʀ ʟᴇs ᴍᴇᴍʙʀᴇs.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
            }
            if (input.includes("ouvre le groupe") || input.includes("débloque le groupe")) {
                await sock.groupSettingUpdate(from, 'not_announcement');
                return extra.reply(`🔓 *ɢʀᴏᴜᴘᴇ ᴏᴜᴠᴇʀᴛ. ʟᴀ ᴘᴀʀᴏʟᴇ ᴇsᴛ ʟɪʙʀᴇ.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
            }
        }

        // 4. Informations système / Humour
        if (input.includes("état du bot") || input.includes("tu dors") || input.includes("ça va")) {
            return extra.reply(`⚡ *ᴏᴘᴇ́ʀᴀᴛɪᴏɴɴᴇʟ. ᴘʀᴇ̂ᴛ ᴀ̀ ᴛᴏᴜᴛ ᴅᴇ́ᴠᴀsᴛᴇʀ sᴜʀ ᴛᴇs ᴏʀᴅʀᴇs.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
        }

        if (input.includes("créateur") || input.includes("qui t'a fait")) {
            return extra.reply(`👑 *ᴊᴇ sᴜɪs ʟ'ᴏᴇᴜᴠʀᴇ ᴅᴇ ᴛʀᴜᴛʜ ᴅᴇᴠɪᴄᴇs, ʟ'ᴇ́ʟɪᴛᴇ ᴅᴇ ғᴀᴅᴀ.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
        }

        // --- CAS 3 : MOTEUR DE REDIRECTION (DANGER / PUISSANCE) ---
        if (global.ghostgMode === 'on' && input !== "" && firstWord !== "") {
            const commands = loadCommands();
            const possibleCmd = commands.get(firstWord) || 
                                [...commands.values()].find(c => c.aliases?.includes(firstWord));

            if (possibleCmd) {
                const newArgs = args.slice(1); 
                try {
                    await react('⚡'); 
                    return await possibleCmd.execute(sock, msg, newArgs, extra);
                } catch (err) {
                    console.error(err);
                    return extra.reply(`❌ *ᴇʀʀᴇᴜʀ : ᴇ́ᴄʜᴇᴄ ᴅᴇ ʟ'ᴇxᴇ́ᴄᴜᴛɪᴏɴ ᴀᴜᴛᴏᴍᴀᴛɪǫᴜᴇ*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
                }
            }
        }

        return; 
    }
};
