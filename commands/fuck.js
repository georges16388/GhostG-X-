import send from "../utils/sendMessage.js";

// 🔹 Fonction pour envoyer le "bug" immersif
async function bug(sock, chatId, participant, count = 1) {
    try {
        await send(sock, chatId, {
            text: `💀 Maître… le participant ${participant} subit l’ombre pour la ${count}ᵉ fois. Les ténèbres observent.`
        });
    } catch (err) {
        console.error("❌ Erreur dans bug():", err);
        await send(sock, chatId, {
            text: `👑 Maître… impossible de toucher ${participant} à l’ombre : ${err.message}`
        });
    }
}

// 🔹 Commande principale
export default async function fuck(sock, message) {
    try {
        const chatId = message.key?.remoteJid;
        if (!chatId) throw new Error("JID du message introuvable.");

        const text = message.message?.extendedTextMessage?.text || message.message?.conversation || '';
        const args = text.trim().split(/\s+/).slice(1);

        // 🔹 Déterminer le participant ciblé
        let participant;
        const quoted = message.message?.extendedTextMessage?.contextInfo?.participant;
        if (quoted) {
            participant = quoted;
        } else if (args.length > 0) {
            participant = args[0].replace("@", "") + "@s.whatsapp.net";
        } else {
            return await send(sock, chatId, { 
                text: "👑 Maître, veuillez spécifier la personne à buguer ou répondez à son message." 
            });
        }

        const num = "@" + participant.replace("@s.whatsapp.net", "");

        await send(sock, chatId, {
            text: `📡 Maître… je prépare les ténèbres pour ${num}…`
        });

        // 🔹 Envoi du bug 30 fois avec 1s intervalle
        for (let i = 1; i <= 30; i++) {
            await bug(sock, chatId, num, i);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        await send(sock, chatId, {
            text: `👑 Maître… l’opération est terminée. ${num} a subi 30 assauts des ombres.`
        });

    } catch (err) {
        console.error("❌ Erreur dans fuck():", err);
        await send(sock, message.key.remoteJid, {
            text: `👑 Maître… une anomalie a empêché l’exécution : ${err.message}`
        });
    }
}

// 🔹 Pour le menu automatique
export const desc = "Invoque un bug immersif sur un participant";
export const usage = "fuck <@participant> ou reply";