// connectToWhatsApp.js
import makeWASocket, { 
    useMultiFileAuthState, 
    DisconnectReason,
    fetchLatestBaileysVersion
} from "baileys";
import fs from "fs";
import path from "path";
import P from "pino";
import send from "./sendMessage.js";
import CONFIG from "../config.js";

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
    // 🔐 Auth et version Baileys
    const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
    const { version } = await fetchLatestBaileysVersion();

    // ⚡ Création du socket
    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: P({ level: "silent" }),
        browser: ["GhostG-X", "Chrome", "1.0.0"]
    });

    console.log("🚀 GhostG-X Bot lancé !");

    // 🔄 Sauvegarde automatique des credentials
    sock.ev.on("creds.update", saveCreds);

    // 🔁 Connexion / déconnexion
    sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode;
            console.log("❌ Déconnecté:", reason);
            if (reason !== DisconnectReason.loggedOut) {
                console.log("🔄 Reconnexion...");
                connectToWhatsApp();
            } else {
                console.log("🚫 Session supprimée. Reconnecte-toi avec un pairing code.");
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
✦ BOT : ${CONFIG.BOT_NAME.toUpperCase()}
✦ Uptime : ${uptime}
✦ RAM : ${used}/${total} MB
✦ CHANNEL : ${CONFIG.CHANNEL_ID}
╚════════════════════════════════════════╝
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

        // 🔑 Pairing code si pas encore enregistré
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

        // 🔥 Commandes basiques
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

export default connectToWhatsApp;