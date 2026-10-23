import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export function getBin(name) {
    const extension = process.platform === 'win32' ? '.exe' : '';
    return path.join(rootDir, '..', 'bin', `${name}${extension}`);
}
