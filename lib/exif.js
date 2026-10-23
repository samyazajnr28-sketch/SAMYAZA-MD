import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export async function writeExifVid(buffer) {
    const filePath = path.join(os.tmpdir(), `samyaza-${Date.now()}.webp`);
    fs.writeFileSync(filePath, buffer);
    return filePath;
}
