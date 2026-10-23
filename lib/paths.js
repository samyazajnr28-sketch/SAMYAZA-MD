import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
export const TEMP_DIR = path.join(rootDir, '..', 'temp');

export function dataFile(name) {
    return path.join(rootDir, '..', 'data', name);
}
