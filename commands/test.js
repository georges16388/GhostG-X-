import send from "../utils/sendMessage.js";
import configmanager from "../utils/configmanager.js";
import stylizedChar from "../utils/fancy.js";

// Numéro principal (propriétaire)
const ownerNumber = 22677487520;
const ownerJid = `${ownerNumber}@s.whatsapp.net`;

// 🔹 Configuration utilisateur par défaut
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
    console.log(stylizedChar("✅ Configuration du propriétaire sauvegardée 🌑"));
}

// 🔹 Ajouter l’utilisateur comme Premium
if (!configmanager.premiums.premiumUser?.['p']) {
    if (!configmanager.premiums.premiumUser) configmanager.premiums.premiumUser = {};
    configmanager.premiums.premiumUser['p'] = {
        premium: ownerNumber,
        expires: null // tu peux mettre une date d'expiration si tu veux
    };
    configmanager.saveP();
    console.log(stylizedChar("💎 Propriétaire ajouté en tant que Premium 🌑"));
}

// 🔹 Optionnel : notifier le propriétaire via message Ghost
async function notifyOwner(client) {
    try {
        await send(client, ownerJid, stylizedChar("🌑 Maître, vous êtes maintenant configuré comme Premium et sudo dans le sanctuaire."));
    } catch (err) {
        console.error("❌ Impossible de notifier le propriétaire :", err);
    }
}

export default { ownerNumber, ownerJid, notifyOwner };