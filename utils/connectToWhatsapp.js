import makeWASocket, { 
    useMultiFileAuthState, 
    DisconnectReason,
    fetchLatestBaileysVersion
} from "@whiskeysockets/baileys";

import fs from "fs";
import P from "pino";
import send from "./utils/sendMessage.js"; // ton utilitaire send

const SESSION_DIR = "./sessionData";
const OWNER_NUMBER = "22677487520"; // ton numéro
const PREFIX = "!";

async function connectToWhatsApp() {

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

            // --- Message de bienvenue Ghost ---
            try {
                const chatId = `${OWNER_NUMBER}@s.whatsapp.net`;
                const imagePath = './database/menu(0).jpg';
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

                const messageOptions = fs.existsSync(imagePath)
                    ? { image: { url: imagePath }, caption: welcomeText }
                    : { text: welcomeText };

                await send(sock, chatId, messageOptions);
                console.log('📩 Message de bienvenue envoyé');
            } catch (err) {
                console.error('❌ Erreur message de bienvenue:', err);
            }

        } else if (connection === "connecting") {
            console.log("⏳ Connexion...");
        }

        // 🔑 Pairing code
        if (!sock.authState.creds.registered) {
            console.log("📲 Génération du pairing code...");
            const code = await sock.requestPairingCode(OWNER_NUMBER);
            console.log("🔑 TON CODE :", code);
        }
    });

    // 📩 Réception messages
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const m = messages[0];
        if (!m.message) return;

        // éviter boucle
        if (m.key.fromMe) return;

        const jid = m.key.remoteJid;

        // Récupérer le texte peu importe la structure
        const text = m.message.conversation
            || m.message.extendedTextMessage?.text
            || m.message.listResponseMessage?.singleSelectReply?.selectedRowId
            || "";

        if (!text) return;

        console.log("📩 Message reçu :", text);

        if (!text.startsWith(PREFIX)) return;

        const args = text.slice(PREFIX.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        // 🔥 commandes
        switch (command) {
            case "ping":
                await send(sock, jid, "🏓 Pong !");
                break;

            case "menu":
                await send(sock, jid, `📜 MENU

${PREFIX}ping - Test bot
${PREFIX}menu - Voir menu
                `);
                break;

            default:
                await send(sock, jid, "❓ Commande inconnue");
        }
    });

    return sock;
}

connectToWhatsApp();