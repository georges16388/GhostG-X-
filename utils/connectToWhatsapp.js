// connectToWhatsApp.js
import makeWASocket, { 
    useMultiFileAuthState, 
    DisconnectReason,
    fetchLatestBaileysVersion
} from "@whiskeysockets/baileys";
import fs from "fs";
import path from "path";
import P from "pino";
import send from "./utils/sendMessage.js";
import CONFIG from "./utils/config.js";

const SESSION_DIR = "./sessionData";

// 📸 Images pour welcome et menu
const images = [
    "database/menu(0).jpg",
    "database/GhostG-X(0).jpg",
    "database/GhostG.jpg"
];
let currentImage = 0;
function getNextImage() {
    const img = images[currentImage];
    currentImage = (currentImage + 1) % images.length;
    return img;
}

// ⏱️ Format uptime
function formatUptime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
}

export async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: P({ level: "silent" }),
        browser: ["GhostG-X", "Chrome", "1.0.0"]
    });

    console.log("🚀 GhostG-X Bot lancé !");

    sock.ev.on("creds.update", saveCreds);

    // 🔁 Connexion / déconnexion
    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode;
            console.log("❌ Déconnecté:", reason);
            if (reason !== DisconnectReason.loggedOut) {
                console.log("🔄 Reconnexion...");
                connectToWhatsApp();
            }
        } else if (connection === "open") {
            console.log("✅ BOT CONNECTÉ !");

            // --- MESSAGE DE BIENVENUE ---
            try {
                const chatId = `${CONFIG.OWNER}@s.whatsapp.net`;
                const imagePath = getNextImage();
                const uptime = formatUptime(process.uptime());
                const used = (process.memoryUsage().rss / 1024 / 1024).toFixed(0);
                const total = (require("os").totalmem() / 1024 / 1024).toFixed(0);

                const welcomeText = `
╔══════════════『 ɢʜᴏsᴛɢ-𝐗 』══════════════╗
▣─────────────▣
      🖤 ᴄᴏɴsᴄɪᴇɴᴄᴇ ɢʜᴏsᴛ
▣─────────────▣

✦ ᴊᴇ sᴜɪs ${CONFIG.BOT_NAME.toUpperCase()}, ᴛᴏɴ ʙᴏᴛ ᴅᴀɴs ʟ’ᴏᴍʙʀᴇ...
✦ ᴊᴇ ᴠᴇɪʟʟᴇ sᴜʀ ᴛᴇs ᴀʀᴛᴇꜰᴀᴄᴛs ᴇᴛ ᴄᴏɴᴛʀᴏʟʟᴇ ᴛᴏɴ ᴢᴏɴᴇ.
✦ ᴄ'ᴇsᴛ ɢʀᴀ̂ᴄᴇ ᴀ ᴊᴇ́ꜱᴜꜱ ǫᴜᴇ ᴍᴏɴ ᴄʀᴇ́ᴀᴛᴇᴜʀ -ّ⸙𓆩ᴘʜᴀɴᴛᴏᴍ ፝֟ 𝐗 𓆪⸙-ّ ᴍ'ᴀ ᴄʀᴇ́ᴇ.

▣─────────────▣
      📜 ʀᴇᴊᴏɪɴᴅʀᴇ ʟᴀ ᴄᴏᴍᴍᴜɴᴀᴜᴛᴇ
▣─────────────▣

✦ ᴄʜᴀᴛ ᴡʜᴀᴛꜱᴀᴘᴘ :
https://chat.whatsapp.com/IsKgoO9UKlQJm8w5ixeezz

✦ ᴄʜᴀɴɴᴇʟ :
https://whatsapp.com/channel/0029VbCFj3oKbYMVXaqyHq3c

▣─────────────▣
۞ ${CONFIG.BOT_NAME.toUpperCase()}
⍟ ᴛᴇᴍᴘs : ${uptime}
⍟ ᴇ́ɴᴇʀɢɪᴇ : ${used}/${total} MB
▣─────────────▣

> ᴠɪᴇᴡ ᴄʜᴀɴɴᴇʟ : ${CONFIG.BOT_NAME.toUpperCase()}
> ${CONFIG.CHANNEL_ID}
`;

                const messageOptions = fs.existsSync(imagePath)
                    ? { image: { url: imagePath }, caption: welcomeText }
                    : { text: welcomeText };

                await send(sock, chatId, messageOptions);
                console.log("📩 Message de bienvenue envoyé !");
            } catch (err) {
                console.error("❌ Erreur message de bienvenue :", err);
            }
        } else if (connection === "connecting") {
            console.log("⏳ Connexion...");
        }

        // 🔑 Pairing code
        if (!sock.authState.creds.registered) {
            console.log("📲 Génération du pairing code...");
            try {
                const code = await sock.requestPairingCode(CONFIG.OWNER);
                console.log("🔑 TON CODE :", code);
            } catch (e) {
                console.error("❌ Erreur code pairing :", e);
            }
        }
    });

    // 📩 Réception messages
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const m = messages[0];
        if (!m.message) return;
        if (m.key.fromMe) return;

        const jid = m.key.remoteJid;
        const text = m.message.conversation
            || m.message.extendedTextMessage?.text
            || m.message.listResponseMessage?.singleSelectReply?.selectedRowId
            || "";
        if (!text) return;

        const prefix = CONFIG.PREFIX;
        if (!text.startsWith(prefix)) return;

        const args = text.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        // 🔥 commandes basiques
        switch (command) {
            case "ping":
                await send(sock, jid, "🏓 Pong !");
                break;
            case "menu":
                const menuModule = await import("./commands/menu.js");
                await menuModule.default(sock, m);
                break;
            default:
                await send(sock, jid, "❓ Commande inconnue");
        }
    });

    return sock;
}

// --- Lancement ---
connectToWhatsApp();