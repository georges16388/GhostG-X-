import send from "../utils/sendMessage.js";

export default async function channelid(client, message) {
    try {
        
let jid = message.key.remoteJid;
if (!jid) return;
let type;
if (jid.includes("@g.us")) type = "group";
else if (jid.includes("@newsletter")) type = "channel";
else type = "private";

     let chatName = "Nom non disponible";
   if (!jid) return;

       if (type === "channel") {
    const metadata = await client.newsletterMetadata(jid);
    console.log("DEBUG CHANNEL METADATA:", metadata);
    if (metadata?.name) chatName = metadata.name;
}  
        
try {
    if (type === "group") {
        const metadata = await client.groupMetadata(jid);
        if (metadata?.subject) chatName = metadata.subject;
    } else if (type === "channel") {
        const metadata = await client.newsletterMetadata(jid);
        if (metadata?.name) chatName = metadata.name;
    } else {
        // Chat privé
        chatName = message.pushName || "Nom non disponible";
    }
} catch (e) {
    // Si ça plante, on met fallback
    chatName = message.pushName || "Nom non disponible";
}
await send(client, jid, {
    text: `📢 *CHAT INFO*\n\nNom : ${chatName}\nID : ${jid}\nType : ${type}`
});