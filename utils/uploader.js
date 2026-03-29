/**
 * Media Uploader Utility - GhostG-X Edition
 * Service: Catbox.moe (Stable)
 */

const axios = require('axios');
const FormData = require('form-data');
const { fileTypeFromBuffer } = require('file-type');

async function uploadByBuffer(buffer) {
    try {
        // 1. Détection dynamique de l'extension
        const type = await fileTypeFromBuffer(buffer);
        const ext = type ? type.ext : 'bin';
        const mime = type ? type.mime : 'application/octet-stream';

        // 2. Construction du formulaire
        const form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('userhash', ''); 
        form.append('fileToUpload', buffer, { 
            filename: `ghostgx-${Date.now()}.${ext}`, 
            contentType: mime 
        });

        // 3. Envoi avec Headers complets
        const response = await axios.post('https://catbox.moe/user/api.php', form, {
            headers: {
                ...form.getHeaders(),
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        if (response.data && typeof response.data === 'string' && response.data.includes('http')) {
            return response.data.trim();
        } else {
            throw new Error('Réponse Catbox invalide : ' + response.data);
        }
    } catch (error) {
        console.error('❌ [ᴜᴘʟᴏᴀᴅ ᴇʀʀᴏʀ]:', error.message);
        throw error;
    }
}

module.exports = { uploadByBuffer };
