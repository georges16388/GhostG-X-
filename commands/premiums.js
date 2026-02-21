import configmanager from "../utils/configmanager.js";

export async function modifyprem(client, message, action) {
    let list = configmanager.premiums || [];

    try {
        const remoteJid = message.key?.remoteJid;
        if (!remoteJid) return;

        const sender = message.key.participant || message.key.remoteJid;
        const owner = "22677487520@s.whatsapp.net";

        // Protection
        if (sender !== owner) {
            await client.sendMessage(remoteJid, { text: "❌ Owner only" });
            return;
        }

        const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || '';
        const args = messageBody.trim().split(/\s+/).slice(1);

        let participant;

        if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            participant = message.message.extendedTextMessage.contextInfo.participant;
        } else if (args.length > 0) {
            const jidMatch = args[0].match(/\d+/);
            if (!jidMatch) throw new Error("Invalid number");
            participant = jidMatch[0] + '@s.whatsapp.net';
        } else {
            await client.sendMessage(remoteJid, { text: "⚠️ Mentionne un utilisateur" });
            return;
        }

        if (action === "add") {
            if (!list.includes(participant)) {
                list.push(participant);
                configmanager.premiums = list;
                configmanager.saveP();

                await client.sendMessage(remoteJid, {
                    text: `✅ @${participant.split('@')[0]} est premium`,
                    mentions: [participant]
                });
            } else {
                await client.sendMessage(remoteJid, { text: "⚠️ Déjà premium" });
            }
        }

        if (action === "remove") {
            list = list.filter(x => x !== participant);
            configmanager.premiums = list;
            configmanager.saveP();

            await client.sendMessage(remoteJid, {
                text: `❌ @${participant.split('@')[0]} retiré du premium`,
                mentions: [participant]
            });
        }

    } catch (error) {
        console.error(error);
    }
}