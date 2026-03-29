/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - Intelligence Artificielle GhostG (NLP & Command Redirection)
 * Version : Prestige V5.2 - Full Power (Design Small Caps)
 * Powered by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

// --- UTILITAIRE LOCAL ---
const toSmallCaps = (text) => {
    const fonts = {'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
    return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

module.exports = {
    name: "ghostg",
    description: "Système NLP intelligent pour exécuter des ordres sans préfixe",
    category: "owner",
    ownerOnly: true,

    async execute(sock, msg, args, extra) {
        const { from, reply, react, prefix, body, isOwner } = extra;
        
        // Sécurité supplémentaire
        if (!isOwner) return;

        const input = body ? body.toLowerCase() : "";
        const firstWord = args[0]?.toLowerCase();

        // --- CAS 1 : CONFIGURATION (AVEC PRÉFIXE EX: .ghostg on) ---
        if (body.startsWith(prefix)) {
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

        // --- CAS 2 : NLP & RÉPONSES AUTOMATIQUES ---

        // 1. Salutations
        if (input.includes("bonjour") || input.includes("salut") || input.includes("hey") || input === "ghostg") {
            return reply(`👋🏾 *${toSmallCaps("présent, mon maître georges. j'attends tes ordres.")}*`);
        }

        // 2. Suppression (Répondre à un message et dire "supprime")
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

        // 4. Informations système / Humour
        if (input.includes("état du bot") || input.includes("tu dors") || input.includes("ça va")) {
            return reply(`⚡ *${toSmallCaps("opérationnel. prêt à tout dévaster sur tes ordres.")}*`);
        }

        if (input.includes("créateur") || input.includes("qui t'a fait")) {
            return reply(`👑 *${toSmallCaps("je suis l'œuvre de truth devices, l'élite de fada.")}*`);
        }

        // --- CAS 3 : MOTEUR DE REDIRECTION (DANGER / PUISSANCE) ---
        // Si tu dis juste "Menu" ou "Infos", GhostG cherche si une commande existe
        const possibleCmd = global.commands.get(firstWord) || 
                    [...global.commands.values()].find(c => c.aliases?.includes(firstWord));

        if (possibleCmd && global.ghostgMode === 'on') {
            const newArgs = args.slice(1); 
            try {
                await react('⚡'); 
                return await possibleCmd.execute(sock, msg, newArgs, extra);
            } catch (err) {
                console.error(err);
                return reply(`❌ *${toSmallCaps("erreur lors de l'exécution automatique")}*`);
            }
        }

        return; 
    }
};
