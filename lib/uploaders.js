import fs from 'node:fs';
import axios from 'axios';

async function uploadTo0x0(filePath) {
    const form = new FormData();
    form.append('file', new Blob([fs.readFileSync(filePath)]), filePath.split(/[\\/]/).pop());
    const response = await axios.post('https://0x0.st', form, { headers: form.getHeaders?.() });
    return { url: String(response.data).trim() };
}

export const uploadFile = uploadTo0x0;

export const uploadToCatbox = uploadTo0x0;
export const uploadToFreeimage = uploadTo0x0;
export const uploadToUguu = uploadTo0x0;
export const uploadToTmpfiles = uploadTo0x0;
export const uploadToQuax = uploadTo0x0;
export const uploadToPomf2 = uploadTo0x0;
export const uploadToPixhost = uploadTo0x0;
export const uploadToLitterbox = async filePath => ({ ...(await uploadTo0x0(filePath)), expires: 'temporary' });
export const uploadToX0 = uploadTo0x0;
