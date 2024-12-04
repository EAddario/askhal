const chai = require('chai');
const chaiAsPromised = require('chai-as-promised').default;
const { readFile } = require('../processContextFile');

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
});
