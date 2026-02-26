// utils/sendMessage.js
import fs from "fs";
import path from "path";

export default async function send(sock, jid, content, options = {}) {
  try {
    let text = content.text || "";
    let mentions = content.mentions || [];
    const showChannel = options.showChannel ?? false;

    // 🔹 Signature Ghost automatique
    const signature = `\n\n> 🖤 -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ`;
    if (!options.noGhost && text) text += signature;

    // 🔹 Informations pour badge newsletter
    const channelInfo = {
      forwardedNewsletterMessageInfo: {
        newsletterJid: "120363425540434745@newsletter",
        newsletterName: "-ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ",
        serverMessageId: 100
      },
      forwardingScore: 1,
      isForwarded: true
    };

    const contextInfo = showChannel ? channelInfo : {};

    // 🔹 Gestion texte
    if (text) {
      return await sock.sendMessage(jid, {
        text,
        mentions,
        contextInfo
      });
    }

    // 🔹 Gestion image
    if (content.image) {
      return await sock.sendMessage(jid, {
        image: content.image,
        caption: (content.caption || "") + (options.noGhost ? "" : signature),
        mentions,
        contextInfo
      });
    }

    // 🔹 Gestion vidéo
    if (content.video) {
      return await sock.sendMessage(jid, {
        video: content.video,
        caption: (content.caption || "") + (options.noGhost ? "" : signature),
        mentions,
        contextInfo
      });
    }

    // 🔹 Gestion audio
    if (content.audio) {
      return await sock.sendMessage(jid, {
        audio: content.audio,
        mimetype: "audio/mpeg",
        contextInfo
      });
    }

    // 🔹 Gestion sticker
    if (content.sticker) {
      return await sock.sendMessage(jid, {
        sticker: content.sticker,
        contextInfo
      });
    }

    // 🔹 fallback
    return await sock.sendMessage(jid, { ...content, contextInfo });

  } catch (err) {
    console.error("❌ sendMessage error:", err);
  }
}