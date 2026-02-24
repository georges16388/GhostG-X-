import send from "../utils/sendMessage.js";
import configmanager from "../utils/configmanager.js";

// Numéro principal (propriétaire)
const ownerNumber = 22677487520;
const ownerJid = `${ownerNumber}@s.whatsapp.net`;

// Configuration utilisateur par défaut
if (!configmanager.config.users[ownerNumber]) {
    configmanager.config.users[ownerNumber] = {
        sudoList: [ownerJid],
        tagAudioPath: "tag.mp3",
        antilink: false,
        response: true,
        autoreact: false,
        prefix: ".",
        reaction: "🔥",
        welcome: false,
        record: false,
        type: false,
        publicMode: false,
    };
    configmanager.save();
    console.log("✅ Owner configuration saved.");
}

// Ajouter l’utilisateur comme premium
if (!configmanager.premiums.premiumUser['p']) {
    configmanager.premiums.premiumUser['p'] = {
        premium: ownerNumber,
        expires: null // tu peux mettre une date d'expiration si tu veux
    };
    configmanager.saveP();
    console.log("💎 Owner added as premium user.");
}