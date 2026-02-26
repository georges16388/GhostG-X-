import send from "../utils/sendMessage.js";
import stylizedChar from "../utils/fancy.js";
import { writeFileSync, unlinkSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

export async function setpp(sock, message) {
    try {
        const jid = message.key.remoteJid;
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        if (!quoted && !message.message?.imageMessage) {
            return await send(sock, jid, {
                text: stylizedChar("👑 Maître, vous devez répondre à une image pour changer ma photo de profil.")
            });
        }

        const media = quoted || message;
        const imageBuffer = await sock.downloadMediaMessage(media);

        if (!imageBuffer) {
            return await send(sock, jid, {
                text: stylizedChar("❌ Maître, je n'ai pas pu télécharger cette image.")
            });
        }

        const tempPath = join(tmpdir(), `pp_${Date.now()}.jpg`);
        writeFileSync(tempPath, imageBuffer);

        await sock.updateProfilePicture(sock.user.id, { url: tempPath });
        unlinkSync(tempPath);

        await send(sock, jid, {
            text: stylizedChar("👑 Maître, ma photo de profil a été changée avec succès. Je suis prêt à vous servir dans l’ombre.")
        });

    } catch (err) {
        console.error("❌ SETPP ERROR:", err);
        await send(sock, message.key.remoteJid, {
            text: stylizedChar("❌ Maître, une erreur est survenue lors du changement de ma photo.")
        });
    }
}

export async function getpp(sock, message) {
    try {
        const jid = message.key.remoteJid;
        const args = message.message?.conversation?.split(" ") || [];

        let targetJid;
        if (args[1] && args[1].includes("@")) {
            targetJid = args[1];
        } else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            targetJid = message.message.extendedTextMessage.contextInfo.participant;
        } else if (jid.includes("@g.us")) {
            targetJid = jid;
        } else {
            targetJid = sock.user.id.split(":")[0] + "@s.whatsapp.net";
        }

        let profilePic;
        try {
            profilePic = await sock.profilePictureUrl(targetJid, "image");
        } catch {
            profilePic = null;
        }

        if (profilePic) {
            await send(sock, jid, {
                image: { url: profilePic },
                caption: stylizedChar("📸 Maître, voici la photo de profil demandée. Observez dans l’ombre.")
            });
        } else {
            await send(sock, jid, {
                text: stylizedChar("❌ Maître, aucune photo de profil n’a été trouvée pour cette entité.")
            });
        }

    } catch (err) {
        console.error("❌ GETPP ERROR:", err);
        await send(sock, message.key.remoteJid, {
            text: stylizedChar("❌ Maître, impossible de récupérer la photo demandée.")
        });
    }
}

export default { setpp, getpp };