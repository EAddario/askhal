import { expect } from 'chai';
import { textContextReader } from '../textContextReader.js';

describe('textContextReader tests', () => {
    it('should read a valid txt file and return its content', async () => {
        const content = await textContextReader('./tests/assets/valid.txt');
        expect(content).to.equal('Hello, World!');
    });

    it('should throw for non-existent file', async () => {
        try {
            await textContextReader('./tests/assets/nonexistent.txt');
            expect.fail('should have thrown');
        } catch (err) {
            expect(err.code).to.equal('ENOENT');
        }
    });

    it('should throw for permission denied', async () => {
        try {
            await textContextReader('./tests/assets/access_denied.txt');
            expect.fail('should have thrown');
        } catch (err) {
            expect(err.code).to.equal('EACCES');
        }
    });

    it('should read an empty file without error', async () => {
        const content = await textContextReader('./tests/assets/empty.txt');
        expect(content).to.equal('');
    });
});
