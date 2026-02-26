import send from "../utils/sendMessage.js";
import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from "baileys";
import fs from "fs";
import pino from "pino";
import configmanager from "../utils/configmanager.js";
import { PREFIX, BOT_NUMBER } from "../config.js";

const SESSION_FOLDER = "./sessionData";

// 📁 Création dossier session
if (!fs.existsSync(SESSION_FOLDER)) {
    fs.mkdirSync(SESSION_FOLDER, { recursive: true });
    console.log("📁 sessionData créé");
}

async function connectToWhatsapp(handleMessage) {
    const { version } = await fetchLatestBaileysVersion();
    console.log("📦 Baileys version:", version.join("."));

    const { state, saveCreds } = await useMultiFileAuthState(SESSION_FOLDER);

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false, // ❌ pas de QR
        logger: pino({ level: "silent" }),
        browser: ["GhostG-X", "Chrome", "1.0"]
    });

    // 💾 sauvegarde session
    sock.ev.on("creds.update", saveCreds);

    let isHandlerRegistered = false;

    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;

        console.log("🔔 Connection:", connection);

        // ❌ Déconnexion
        if (connection === "close") {
            const code = lastDisconnect?.error?.output?.statusCode;

            console.log("❌ Déconnecté:", code);

            if (code !== DisconnectReason.loggedOut) {
                console.log("🔄 Reconnexion...");
                setTimeout(() => connectToWhatsapp(handleMessage), 5000);
            } else {
                console.log("🚫 Session supprimée, relance le bot");
            }
        }

        // ⏳ Connexion
        if (connection === "connecting") {
            console.log("⏳ Connexion...");
        }

        // ✅ Connecté
        if (connection === "open") {
            console.log("✅ Connecté à WhatsApp");

            // Listener messages
            if (!isHandlerRegistered) {
                sock.ev.on("messages.upsert", async (msg) => {
                    try {
                        await handleMessage(sock, msg, { PREFIX, BOT_NUMBER });
                    } catch (e) {
                        console.error("❌ Handler error:", e);
                    }
                });
                isHandlerRegistered = true;
            }

            // 🔥 Message de bienvenue
            try {
                const chatId = `${BOT_NUMBER}@s.whatsapp.net`;
                const image = "./database/menu(0).jpg";

                const text = `
╔═════════════════════════╗
║      👻 ᴏᴍʙʀᴇ ɢʜᴏsᴛ ɢ-𝐗 👻      ║
╠═════════════════════════╣
║ 🔥 Le spectre s’éveille... ║
║ ⚡ Les ténèbres obéissent ║
║ 💀 Sanctuaire sécurisé ║
╠═════════════════════════╣
> 🌑 Dans l’ombre, je veille  
> ᴊᴇꜱᴜꜱ ᴛ’ᴀɪᴍᴇ
╚═════════════════════════╝
`;

                const msgOptions = fs.existsSync(image)
                    ? { image: { url: image }, caption: text }
                    : { text };

                await sock.sendMessage(chatId, msgOptions);

                console.log("📩 Welcome envoyé");
            } catch (err) {
                console.log("❌ Welcome error:", err);
            }
        }
    });

    // 🔥 PAIRING CODE
    setTimeout(async () => {
        if (!state.creds.registered) {
            try {
                console.log("⚠️ Génération du pairing code...");

                const code = await sock.requestPairingCode(BOT_NUMBER);

                console.log("\n📲 TON CODE WHATSAPP:");
                console.log("👉", code, "\n");

                // 🔥 config auto
                configmanager.setUser(BOT_NUMBER, {
                    prefix: PREFIX,
                    publicMode: true
                });

            } catch (err) {
                console.log("❌ Pairing error:", err);
            }
        }
    }, 3000);

    return sock;
}

export default connectToWhatsapp;