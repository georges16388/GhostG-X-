import send from "../utils/sendMessage.js";
import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from "baileys";
import fs from "fs";
import pino from "pino";
import { PREFIX, BOT_NUMBER } from "../config.js";

const SESSION_FOLDER = "./sessionData";

// 🔹 Création du dossier session
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
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        markOnlineOnConnect: true,
        syncFullHistory: false,
        keepAliveIntervalMs: 10000,
        connectTimeoutMs: 60000,
    });

    // 🔹 Sauvegarde session
    sock.ev.on("creds.update", saveCreds);

    let isHandlerRegistered = false;

    // 🔥 CONNECTION HANDLER
    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;

        console.log("🔔 Connexion:", connection);

        if (connection === "connecting") {
            console.log("⏳ Connexion en cours...");
        }

        if (connection === "open") {
            console.log("✅ Connecté à WhatsApp !");

            // 🔹 éviter double listener
            if (!isHandlerRegistered) {
                sock.ev.on("messages.upsert", async (msg) => {
                    try {
                        await handleMessage(sock, msg, { PREFIX, BOT_NUMBER });
                    } catch (err) {
                        console.error("❌ Handler error:", err);
                    }
                });
                isHandlerRegistered = true;
            }

            // 🔥 MESSAGE DE BIENVENUE
            try {
                const chatId = `${BOT_NUMBER}@s.whatsapp.net`;

                const welcomeText = `
╔═════════════════════════╗
║      👻 ᴏᴍʙʀᴇ ɢʜᴏsᴛ ɢ-𝐗 👻      ║
╠═════════════════════════╣
║ 🔥 Le spectre s’éveille...            ║
║ ⚡ Les ténèbres obéissent à votre volonté ║
║ 💀 Votre sanctuaire est sécurisé      ║
╠═════════════════════════╣
> 🌑 Dans l’ombre, je veille sur les artefacts  
> ᴊᴇꜱᴜꜱ ᴛ’ᴀɪᴍᴇ ᴍᴇ̂ᴍᴇ ᴅᴀɴs ʟ’ᴏᴍʙʀᴇ
╚═════════════════════════╝
`;

                const imagePath = "./database/menu(0).jpg";

                const options = fs.existsSync(imagePath)
                    ? { image: { url: imagePath }, caption: welcomeText }
                    : { text: welcomeText };

                await sock.sendMessage(chatId, options);

                console.log("📩 Message de bienvenue envoyé");
            } catch (err) {
                console.error("❌ Erreur message:", err);
            }
        }

        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode;

            console.log("❌ Déconnecté:", reason);

            if (reason !== DisconnectReason.loggedOut) {
                console.log("🔄 Reconnexion...");
                setTimeout(() => connectToWhatsapp(handleMessage), 5000);
            } else {
                console.log("🚫 Session expirée, supprime sessionData");
            }
        }
    });

    // 🔥 PAIRING CODE
    setTimeout(async () => {
        if (!state.creds.registered) {
            try {
                console.log("🔑 Génération du pairing code...");

                const cleanNumber = BOT_NUMBER.replace(/[^0-9]/g, "");

                let code = await sock.requestPairingCode(cleanNumber);

                // format ABCD-EFGH
                code = code.match(/.{1,4}/g).join("-");

                console.log("📲 TON CODE WHATSAPP :", code);

            } catch (err) {
                console.error("❌ Pairing error:", err);
            }
        }
    }, 8000);

    return sock;
}

export default connectToWhatsapp;