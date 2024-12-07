const fs = require('fs').promises;
const officeParser = require('officeparser');
const axios = require('axios');
const { convert } = require('html-to-text');
const { log } = require('./util');

const validContextTypes = ['docx', 'html', 'odt', 'odp', 'ods', 'pdf', 'pptx', 'txt', 'xlsx'];

/**
 * Reads a file from the file system
 * @param contextPath The path to the context file
 * @param contextType The type of the context file
 * @returns {Promise<string>} Returns the parsed content if it's a valid file, or undefined otherwise
 * @throws {Error} If the file type is invalid or the context file is empty
 */
async function readFile(contextPath, contextType) {
    if (!validContextTypes.includes(contextType)) {
        log.error(`'${contextType}' is not a valid file type. Only ${validContextTypes.join(', ')} are supported`);
        throw new Error(`'${contextType}' is not a valid file type`);
    }

    try {
        let fileContent;
        switch (contextType) {
            case 'txt':
                let txtFiles = contextPath.split(',');
                for (let txtFile of txtFiles) {
                    log.info(`Reading ${txtFile}`);
                    fileContent += `${await fs.readFile(txtFile.trim(), 'utf8')} `;
                }

                break;
            case 'html':
                let urls = contextPath.split(',');
                for (let url of urls) {
                    if (!/^https?:\/\//i.test(url)) {
                        url = 'http://' + url.trim();
                    }
                    log.info(`Fetching ${url}`);
                    let webContent = await axios.get(url);
                    fileContent += `${convert(webContent.data)} `;
                }
                break;
            default:
                let officeFiles = contextPath.split(',');
                for (let officeFile of officeFiles) {
                    log.info(`Reading ${txtFile}`);
                    fileContent += `${await officeParser.parseOfficeAsync(officeFile.trim(), { ignoreNotes: true, outputErrorToConsole: false })} `;
                }
        }

        if (!fileContent || !fileContent.trim()) {
            const err = new Error(`context ${contextPath} is empty`);
            err.code = 'EEMPTY';
            throw err;
        }

        const lineCount = fileContent.trim().split(/\r\n|\r|\n/).length;
        log.info(`Processed ${lineCount} lines`);

        return fileContent.replace(/[\n\r\t]|\s+/gm, ' ');
    } catch (err) {
        if (err.code === 'ENOENT') {
            log.error(`context ${contextPath} not found`);
        } else if (err.code === 'EACCES') {
            log.error(`permission denied when accessing context ${contextPath}`);
        } else if (err.code === 'EEMPTY') {
            log.error(`context ${contextPath} is empty`);
        } else if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
            log.error(`connection timeout getting context ${contextPath}`);
        } else if (err.code === 'ERR_NETWORK') {
            log.error(`network error getting context ${contextPath}`);
        } else if (err.code === 'ERR_BAD_RESPONSE') {
            log.error(`context response cannot be parsed properly from ${contextPath}`);
        } else if (err.code === 'ERR_BAD_REQUEST' || err.code === 'ERR_INVALID_URL') {
            log.error(`context path ${contextPath} is not valid`);
        } else {
            log.error(`cannot read context ${contextPath}`);
        }

        throw err;
    }
}

module.exports = { readFile };
