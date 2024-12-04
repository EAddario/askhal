const fs = require('fs').promises;
const officeParser = require('officeparser');
const { log } = require('./util');

const validFileTypes = ['docx', 'odt', 'odp', 'ods', 'pdf', 'pptx', 'txt', 'xlsx'];

/**
 * Reads a file from the file system
 * @param inputFilePath The path to the context file
 * @param inputFileType The type of the context file
 * @returns {Promise<string>} Returns the parsed content if it's a valid file, or undefined otherwise
 * @throws {Error} If the file type is invalid or the context file is empty
 */
async function readFile(inputFilePath, inputFileType) {
    if (!validFileTypes.includes(inputFileType.toLowerCase())) {
        log.error(`Error: ${inputFileType} is not a valid file type`);
        log.error(`askhal only supports the following file types: ${validFileTypes.join(', ')}`);
        throw new Error(`Error: ${inputFileType} is not a valid file type`);
    }

    try {
        const fileContent = (inputFileType.toLowerCase() === 'txt')
            ? await fs.readFile(inputFilePath, 'utf8')
            : await officeParser.parseOfficeAsync(inputFilePath);

        if (!fileContent || !fileContent.trim()) {
            log.error(`Error: ${inputFilePath} is empty`);
            throw new Error(`Error: file ${inputFilePath} is empty`);
        }

        const lineCount = fileContent.trim().split(/\r\n|\r|\n/).length;
        log.info(`Processed ${lineCount} lines from ${inputFilePath}`);

        return fileContent;
    } catch (err) {
        if (err.code === 'ENOENT') {
            log.error(`Error: File ${inputFilePath} not found`);
        } else if (err.code === 'EACCES') {
            log.error(`Error: Permission denied for file ${inputFilePath}`);
        } else {
            log.error(`Error reading file ${inputFilePath}`);
        }

        throw err;
    }
}

module.exports = { readFile };
