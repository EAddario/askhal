import { expect } from 'chai';
import { officeContextReader } from '../officeContextReader.js';

describe('officeContextReader tests', () => {
    const validFiles = ['valid.docx', 'valid.pptx', 'valid.xlsx', 'valid.pdf'];

    for (const file of validFiles) {
        it(`should read ${file} and return its content`, async () => {
            const content = await officeContextReader(`./tests/assets/${file}`);
            expect(content.trim()).to.equal('Hello, World!');
        });
    }

    const invalidFiles = ['invalid.docx', 'invalid.pptx', 'invalid.xlsx'];

    for (const file of invalidFiles) {
        it(`should throw for ${file}`, async () => {
            try {
                await officeContextReader(`./tests/assets/${file}`);
                expect.fail('should have thrown');
            } catch (err) {
                expect(err).to.be.an('error');
            }
        });
    }

    it('should throw for non-existent file', async () => {
        try {
            await officeContextReader('./tests/assets/nonexistent.docx');
            expect.fail('should have thrown');
        } catch (err) {
            expect(err).to.be.an('error');
        }
    });
});
