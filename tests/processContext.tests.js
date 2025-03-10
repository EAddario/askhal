import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { readFile } from '../processContext.js';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('readFile() tests', () => {
    it('should read a valid txt file and return its content', async () => {
        const filePath = './tests/assets/valid.txt';
        const fileType = 'txt';
        const fileContent = 'Hello, World!';

        const content = await readFile(filePath, fileType);
        return expect(content).to.equal(fileContent);
    });

    it('should read a valid Excel file and return its content', async () => {
        const filePath = './tests/assets/valid.xlsx';
        const fileType = 'xlsx';
        const fileContent = 'Hello, World!';
        const content = await readFile(filePath, fileType);
        return expect(content).to.equal(fileContent);
    });

    it('should read a valid PowerPoint file and return its content', async () => {
        const filePath = './tests/assets/valid.pptx';
        const fileType = 'pptx';
        const fileContent = 'Hello, World!';
        const content = await readFile(filePath, fileType);
        return expect(content).to.equal(fileContent);
    });

    it('should read a valid Word file and return its content', async () => {
        const filePath = './tests/assets/valid.docx';
        const fileType = 'docx';
        const fileContent = 'Hello, World!';
        const content = await readFile(filePath, fileType);
        return expect(content).to.equal(fileContent);
    });

    it('should read a valid pdf file and return its content', async () => {
        const filePath = './tests/assets/valid.pdf';
        const fileType = 'pdf';
        const fileContent = 'Hello, World!';
        const content = await readFile(filePath, fileType);
        return expect(content.trim()).to.equal(fileContent);
    });

    it('should throw an error for invalid file type', async () => {
        const filePath = './tests/assets/file.invalid';
        const fileType = 'invalid';
        return expect(readFile(filePath, fileType)).to.be.rejectedWith("'invalid' is not a valid file type");

    });

    it('should throw an error for invalid Excel file', async () => {
        const filePath = './tests/assets/invalid.xlsx';
        const fileType = 'xlsx';
        return expect(readFile(filePath, fileType)).to.be.rejectedWith("[OfficeParser]: Error");
    });

    it('should throw an error for invalid PowerPoint file', async () => {
        const filePath = './tests/assets/invalid.pptx';
        const fileType = 'pptx';
        return expect(readFile(filePath, fileType)).to.be.rejectedWith("[OfficeParser]: Error");
    });

    it('should throw an error for invalid Word file', async () => {
        const filePath = './tests/assets/invalid.docx';
        const fileType = 'docx';
        return expect(readFile(filePath, fileType)).to.be.rejectedWith("[OfficeParser]: Error");
    });

    it('should throw an error for file not found', async () => {
        const filePath = './tests/assets/nonexistent.txt';
        const fileType = 'txt';
        expect(readFile(filePath, fileType)).to.be.rejectedWith(Error);
        return expect(readFile(filePath, fileType)).to.be.rejectedWith("ENOENT: no such file or directory");
    });

    // TODO: Important! Before running this test, create the invalid.txt file and change its access control to something like 000 or 222
    it('should throw an error for permission denied', async () => {
        const filePath = './tests/assets/access_denied.txt';
        const fileType = 'txt';
        expect(readFile(filePath, fileType)).to.be.rejectedWith(Error);
        return expect(readFile(filePath, fileType)).to.be.rejectedWith("EACCES: permission denied");
    });

    it('should throw an error for file is empty', async () => {
        const filePath = './tests/assets/empty.txt';
        const fileType = 'txt';
        expect(readFile(filePath, fileType)).to.be.rejectedWith(Error);
        return expect(readFile(filePath, fileType)).to.be.rejectedWith("context ./tests/assets/empty.txt is empty");
    });
});
