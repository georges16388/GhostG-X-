import send from "../utils/sendMessage.js";

export default async function channelid(client, message) {
    let jid = message.key.remoteJid;
    if (!jid) return;

    let type;
    let chatName = "Nom non disponible";

    try {
        if (jid.includes("@g.us")) type = "group";
        else if (jid.includes("@newsletter")) type = "channel";
        else type = "private";

        if (type === "group") {
            const metadata = await client.groupMetadata(jid);
            if (metadata?.subject) chatName = metadata.subject;
        } else if (type === "channel")) {
            const metadata = await client.newsletterMetadata(jid);
            if (metadata?.name) chatName = metadata.name;
        } else {
            chatName = message.pushName || "Nom non disponible";
        }
    } catch (e) {
        console.error("Erreur dans channelid:", e);
    }

    await send(client, jid, {
        text: `📢 *CHAT INFO*\n\nNom : ${chatName}\nID : ${jid}\nType : ${type}`
    });
}