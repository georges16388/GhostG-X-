import stylizedChar from "../utils/fancy.js";
async function sender(message, client, texts) {

const remoteJid = message?.key?.remoteJid;  

try {  
    await client.sendMessage(remoteJid, {  

        text: stylizedChar(`> _*${texts}*_\n\n⏤͟͟͞ＧＨＯＳＴＧ－Ｘ`),  
  
    });  
} catch (e) {  
    console.log(e)  
    return;  
}

}

//22677487520@s.whatsapp.net

export default sender;
