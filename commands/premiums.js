import configmanager from "../utils/configmanager.js";
import fs from 'fs';

export async function modifyprem(client, message, action) {
    const filePath = "db.json";
    
    // ✅ S'assurer que premiums est toujours un tableau
    let list = Array.isArray(configmanager.premiums) ? configmanager.premiums : [];

    try {  
        const remoteJid = message.key?.remoteJid;  
        if (!remoteJid) throw new Error("Invalid remote JID.");  

        // 🔒 Owner only protection  
        const owner = "22677487520@s.whatsapp.net";  
        const sender = message.key.participant || message.key.remoteJid;  
        if (sender !== owner) {  
            await client.sendMessage(remoteJid, { text: "❌ Owner only" });  
            return;  
        }  

        const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || '';  
        const commandAndArgs = messageBody.slice(1).trim();  
        const parts = commandAndArgs.split(/\s+/);  
        const args = parts.slice(1);  

        let participant;  
        if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {  
            participant = message.message?.extendedTextMessage?.contextInfo?.participant || message.key.participant;  
        } else if (args.length > 0) {  
            const jidMatch = args[0].match(/\d+/);  
            if (!jidMatch) throw new Error("Invalid participant format.");  
            participant = jidMatch[0] + '@s.whatsapp.net';  
        } else {  
            throw new Error("No participant specified.");  
        }  

        if (action === "add") {  
            if (!list.includes(participant)) {  
                list.push(participant);  
                configmanager.premiums = list; // 🔹 Mettre à jour configmanager
                configmanager.saveP();  
            }  
        } else if (action === "remove") {  
            list = list.filter(item => item !== participant);  
            configmanager.premiums = list;  
            configmanager.saveP();  
        }  
    } catch (error) {  
        console.error("Error in premium list:", error);  
    }
}

export async function addprem(client, message) {
    await modifyprem(client, message, "add");
}

export async function delprem(client, message) {
    await modifyprem(client, message, "remove");
}

export default { addprem, delprem };