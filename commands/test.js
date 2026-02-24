import send from "../utils/sendMessage.js";
import configmanager from "../utils/configmanager.js";

const number = 22677487520
configmanager.config.users[number] = {
    sudoList: ['22677487520@s.whatsapp.net'],
    tagAudioPath: "tag.mp3",
    antilink: false,
    response: true,
    autoreact: false,
    prefix: ".",
    reaction: "🔥",
    welcome: false,
    record:false,
    type:false,
    publicMode:false,
}
configmanager.save()

configmanager.premiums.premiumUser[`p`] = {
    premium: number,
} 
configmanager.saveP()