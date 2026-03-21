/**
 * Helper Utilities - AGM Helper-Core
 * Typographie : ꜱᴍᴀʟʟ ᴄᴀᴘꜱ ᴘʀᴇᴍɪᴜᴍ
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const axios = require('axios');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

/**
 * Téléchargement de média (Buffer optimisé)
 */
const downloadMedia = async (message) => {
  try {
    const type = Object.keys(message)[0];
    const mime = message[type].mimetype || '';
    const stream = await downloadContentFromMessage(
        message[type], 
        type.replace('Message', '').toLowerCase()
    );
    
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
  } catch (e) {
    throw new Error(`❌ [ᴀɢᴍ_ᴅʟ_ꜰᴀɪʟ] : ${e.message}`);
  }
};

/**
 * Temps de fonctionnement (Runtime) stylisé
 */
const runtime = (seconds) => {
  seconds = Number(seconds);
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor(seconds % (3600 * 24) / 3600);
  const m = Math.floor(seconds % 3600 / 60);
  const s = Math.floor(seconds % 60);
  
  const res = [];
  if (d > 0) res.push(`${d}ᴅ`);
  if (h > 0) res.push(`${h}ʜ`);
  if (m > 0) res.push(`${m}ᴍ`);
  if (s > 0) res.push(`${s}ꜱ`);
  
  return res.join(' ') || '0ꜱ';
};

/**
 * Taille de fichier lisible
 */
const formatSize = (bytes) => {
  if (bytes === 0) return '0 ʙʏᴛᴇꜱ';
  const k = 1024;
  const sizes = ['ʙʏᴛᴇꜱ', 'ᴋʙ', 'ᴍʙ', 'ɢʙ'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Extraction des mentions @user
 */
const parseMentions = (text = '') => {
  return [...text.matchAll(/@(\d+)/g)].map(v => v[1] + '@s.whatsapp.net');
};

/**
 * Upload temporaire (Service stable)
 */
const uploadFile = async (buffer) => {
  try {
    const FormData = require('form-data');
    const form = new FormData();
    form.append('file', buffer, { filename: `ghostg_${Date.now()}.bin` });
    
    const res = await axios.post('https://file.io', form, {
      headers: { ...form.getHeaders() }
    });
    return res.data.link;
  } catch (e) {
    return '❌ [ᴜᴘʟᴏᴀᴅ_ꜰᴀɪʟ]';
  }
};

/**
 * Fonctions utilitaires rapides
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
const isUrl = (url) => url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/, 'gi'));

module.exports = {
  downloadMedia,
  runtime,
  formatSize,
  sleep,
  parseMentions,
  uploadFile,
  random,
  isUrl
};
