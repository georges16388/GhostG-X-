/**
 * Media Uploader Utility - GhostG-X Edition
 * Services: Telegra.ph & Catbox
 */

const axios = require('axios');
const FormData = require('form-data');
const { fileTypeFromBuffer } = require('file-type');

/**
 * Upload un buffer vers un service de cloud public
 * @param {Buffer} buffer - Le contenu du média
 * @returns {Promise<string>} - L'URL du média hébergé
 */
async function uploadByBuffer(buffer) {
    try {
        const { ext, mime } = await fileTypeFromBuffer(buffer) || { ext: 'bin', mime: 'application/octet-stream' };
        
        // On utilise un formulaire pour envoyer le fichier
        const form = new FormData();
        form.append('fileToUpload', buffer, { filename: `ghostgx.${ext}`, contentType: mime });
        form.append('reqtype', 'fileupload');
        form.append('userhash', ''); // Catbox n'en nécessite pas pour l'anonyme

        // On utilise Catbox.moe (très stable pour les bots)
        const response = await axios.post('https://catbox.moe/user/api.php', form, {
            headers: {
                ...form.getHeaders(),
                'User-Agent': 'Mozilla/5.0'
            }
        });

        if (response.data && typeof response.data === 'string') {
            return response.data.trim(); // Retourne l'URL directe (ex: https://files.catbox.moe/xxxx.jpg)
        } else {
            throw new Error('Invalid response from Catbox');
        }
    } catch (error) {
        console.error('Upload Error:', error.message);
        throw error;
    }
}

module.exports = { uploadByBuffer };
