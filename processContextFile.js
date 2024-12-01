const fs = require('fs').promises;
const officeParser = require('officeparser');
const { log } = require('./util');

const validFileTypes = ['docx', 'odt', 'odp', 'ods', 'pdf', 'pptx', 'txt', 'xlsx'];

/**
 * Reads a file from the file system
 * @param inputFilePath
 * @param inputFileType
 * @returns {Promise<string|*>}
 * @throws {Error} When file type is invalid or file is empty
 */
async function readFile(inputFilePath, inputFileType) {
    if (!validFileTypes.includes(inputFileType)) {
        log.error(`Error: ${inputFileType} is not a valid file type`);
        log.error(`Program only supports the following file types: ${validFileTypes.join(', ')}`);
        process.exit(1);
    }

    try {
        const fileContent = (inputFileType === 'txt')
            ? await fs.readFile(inputFilePath, 'utf8')
            : await officeParser.parseOfficeAsync(inputFilePath);

        if (!fileContent || !fileContent.trim()) {
            throw new Error(`Error: file ${inputFilePath} is empty`);
        }

        const lineCount = fileContent.trim().split(/\r\n|\r|\n/).length;
        log.info(`Processed ${lineCount} lines`);
        return fileContent;
    } catch (err) {
        log.error(`Error reading file ${inputFilePath}`);
        throw err;
    }
}

module.exports = { readFile };
