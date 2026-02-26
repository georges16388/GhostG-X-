// utils/sendMessage.js

export default async function send(sock, jid, content, options = {}) {
    try {

        let text = content.text || "";
        let mentions = content.mentions || [];

        // 🔥 Signature Ghost automatique
        const signature = `\n\n> 🖤 -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ`;

        // 🔥 Désactiver signature si demandé
        if (!options.noGhost) {
            if (text) text += signature;
        }

        // 🔥 Gestion texte
        if (text) {
            return await sock.sendMessage(jid, {
                text,
                mentions
            });
        }

        // 🔥 Gestion image
        if (content.image) {
            return await sock.sendMessage(jid, {
                image: content.image,
                caption: (content.caption || "") + (options.noGhost ? "" : signature),
                mentions
            });
        }

        // 🔥 Gestion vidéo
        if (content.video) {
            return await sock.sendMessage(jid, {
                video: content.video,
                caption: (content.caption || "") + (options.noGhost ? "" : signature),
                mentions
            });
        }

        // 🔥 Gestion audio
        if (content.audio) {
            return await sock.sendMessage(jid, {
                audio: content.audio,
                mimetype: "audio/mpeg"
            });
        }

        // 🔥 Gestion sticker
        if (content.sticker) {
            return await sock.sendMessage(jid, {
                sticker: content.sticker
            });
        }

        // 🔥 fallback
        return await sock.sendMessage(jid, content);

    } catch (err) {
        console.error("❌ sendMessage error:", err);
    }
}