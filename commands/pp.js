import send from "../utils/sendMessage.js";
import { writeFileSync, unlinkSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

export async function setpp(sock, message) {
    try {
        const remoteJid = message.key.remoteJid;
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        if (!quoted && !message.message?.imageMessage) {
            return await send(sock, remoteJid, { text: "📸 Réponds à une image." });
        }

        const media = quoted ? quoted : message;
        const imageBuffer = await sock.downloadMediaMessage(media);

        if (!imageBuffer) {
            return await send(sock, remoteJid, { text: "❌ Impossible de télécharger l'image." });
        }

        const tempPath = join(tmpdir(), `pp_${Date.now()}.jpg`);
        writeFileSync(tempPath, imageBuffer);

        await sock.updateProfilePicture(sock.user.id, { url: tempPath });

        unlinkSync(tempPath);

        await send(sock, remoteJid, { text: "✅ Photo changée 🚀" });

    } catch (err) {
        console.error("SETPP ERROR:", err.message);
        await send(sock, message.key.remoteJid, { text: "❌ Erreur" });
    }
}

export async function getpp(sock, message) {
    try {
        const remoteJid = message.key.remoteJid;
        const args = message.message?.conversation?.split(" ") || [];

        let targetJid;
        if (args[1] && args[1].includes("@")) {
            targetJid = args[1];
        } else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            targetJid = message.message.extendedTextMessage.contextInfo.participant;
        } else if (remoteJid.includes("@g.us")) {
            targetJid = remoteJid;
        } else {
            targetJid = sock.user.id.split(":")[0] + "@s.whatsapp.net";
        }

        const profilePic = await sock.profilePictureUrl(targetJid, "image");

        if (profilePic) {
            await send(sock, remoteJid, {
                image: { url: profilePic },
                caption: "📸 Photo récupérée ✅"
            });
        } else {
            await send(sock, remoteJid, { text: "❌ Aucune photo trouvée." });
        }

    } catch (err) {
        console.error("GETPP ERROR:", err.message);
        await send(sock, message.key.remoteJid, { text: "❌ Impossible." });
    }
}

export default { setpp, getpp };