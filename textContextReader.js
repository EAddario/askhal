import { promises as fs } from 'fs';

export async function textContextReader(source) {
    return await fs.readFile(source.trim(), 'utf8');
}
