import { uploadToUguu } from './uploaders.js';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export async function uploadImage(buffer) {
    const filePath = path.join(os.tmpdir(), `samyaza-image-${Date.now()}.jpg`);
    fs.writeFileSync(filePath, buffer);
    try { return (await uploadToUguu(filePath)).url; }
    finally { fs.rmSync(filePath, { force: true }); }
}
