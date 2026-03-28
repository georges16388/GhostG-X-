/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - Intelligence Artificielle GhostG (NLP & Command Redirection)
 * Version : Prestige V5.2 - Full Power (Design Small Caps)
 */

const { toSmallCaps } = require('../../utils/format'); 

module.exports = {
    name: "ghostg",
    description: "Système NLP intelligent pour exécuter des ordres sans préfixe",
    category: "owner",
    ownerOnly: true,

    async execute(sock, msg, args, extra) {
        const { from, reply, isOwner, react, prefix, body } = extra;
        const input = args.join(' ').toLowerCase();
        const firstWord = args[0]?.toLowerCase();

        // --- CAS 1 : CONFIGURATION (AVEC PRÉFIXE) ---
        if (msg.body && msg.body.startsWith(prefix)) {
            if (firstWord === 'on') {
                global.ghostgMode = 'on';
                await react('🧠');
                return reply(`✅ *ɢʜᴏsᴛɢ ɪɴᴛᴇʟ* : *${toSmallCaps("activé. je t'écoute désormais.")}*`);
            }
            if (firstWord === 'off') {
                global.ghostgMode = 'off';
                await react('💤');
                return reply(`💡 *ɢʜᴏsᴛɢ ɪɴᴛᴇʟ* : *${toSmallCaps("mis en veille.")}*`);
            }
            return reply(`🤖 *ɢʜᴏsᴛɢ ᴄᴏɴᴛʀᴏʟ* : *${global.ghostgMode === 'on' ? '🟢 ᴏɴ' : '🔴 ᴏғғ'}*`);
        }

        // --- CAS 2 : NLP & RÉPONSES AUTOMATIQUES (DESIGN SMALL CAPS) ---
        
        // 1. Salutations & Présence
        if (input.includes("bonjour") || input.includes("salut") || input.includes("hey") || input.includes("ghostg ?")) {
            return reply(`👋🏾 *${toSmallCaps("présent, mon maître georges. j'attends tes ordres.")}*`);
        }

        // 2. Antidelete / Suppression rapide
        if (input.includes("supprime") || input.includes("efface") || input.includes("delete")) {
            const quoted = msg.message.extendedTextMessage?.contextInfo;
            if (quoted?.stanzaId) {
                const key = {
                    remoteJid: from,
                    fromMe: quoted.participant === sock.user.id.split(':')[0] + '@s.whatsapp.net',
                    id: quoted.stanzaId,
                    participant: quoted.participant
                };
                await sock.sendMessage(from, { delete: key });
                return react('🗑️');
            }
        }

        // 3. Gestion du groupe (Lock/Unlock)
        if (input.includes("ferme le groupe") || input.includes("bloque le groupe")) {
            await sock.groupSettingUpdate(from, 'announcement');
            return reply(`🔒 *${toSmallCaps("groupe verrouillé. repos pour les membres.")}*`);
        }
        if (input.includes("ouvre le groupe") || input.includes("débloque le groupe")) {
            await sock.groupSettingUpdate(from, 'not_announcement');
            return reply(`🔓 *${toSmallCaps("groupe ouvert. la parole est libre.")}*`);
        }

        // 4. Informations système rapides
        if (input.includes("état du bot") || input.includes("ca va") || input.includes("tu dors")) {
            const uptime = process.uptime();
            const hours = Math.floor(uptime / 3600);
            return reply(`⚡ *${toSmallCaps("en ligne depuis")}* ${hours}ʜ. *${toSmallCaps("prêt à tout dévaster.")}*`);
        }

        // 5. Humour / Prestige
        if (input.includes("qui est ton créateur") || input.includes("qui t'a fait")) {
            return reply(`👑 *${toSmallCaps("je suis l'œuvre de truth devices, l'élite de fada.")}*`);
        }

        // 6. Protection & Sécurité
        if (input.includes("bloque cet utilisateur") || input.includes("block user")) {
            const target = msg.message.extendedTextMessage?.contextInfo?.participant;
            if (target) {
                await sock.updateBlockStatus(target, "block");
                return reply(`🚫 *${toSmallCaps("utilisateur banni de mes circuits.")}*`);
            }
        }

        // --- CAS 3 : MOTEUR DE REDIRECTION (EXÉCUTION AUTOMATIQUE) ---
        const possibleCmd = global.commands.get(firstWord) || global.commands.find(c => c.aliases && c.aliases.includes(firstWord));

        if (possibleCmd) {
            const newArgs = args.slice(1); 
            try {
                await react('⚡'); 
                return await possibleCmd.execute(sock, msg, newArgs, extra);
            } catch (err) {
                console.error(err);
                return reply(`❌ *${toSmallCaps("erreur lors de l'exécution automatique de")}* ${firstWord.toUpperCase()}`);
            }
        }

        return; // Silence si rien n'est matché
    }
};
