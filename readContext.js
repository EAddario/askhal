import { log } from './log.js';
import { textContextReader } from './textContextReader.js';
import { webContextReader } from './webContextReader.js';
import { officeContextReader } from './officeContextReader.js';

const readers = {
    txt: textContextReader,
    html: webContextReader,
    docx: officeContextReader,
    odt: officeContextReader,
    odp: officeContextReader,
    ods: officeContextReader,
    pdf: officeContextReader,
    pptx: officeContextReader,
    xlsx: officeContextReader,
};

const validContextTypes = Object.keys(readers);

async function readContext(contextPath, contextType) {
    if (!validContextTypes.includes(contextType)) {
        log.error(`'${contextType}' is not a valid file type. Only ${validContextTypes.join(', ')} are supported`);
        throw new Error(`'${contextType}' is not a valid file type`);
    }

    try {
        const reader = readers[contextType];
        const sources = contextPath.split(',');
        let fileContent = '';

        for (const source of sources) {
            log.info(`Reading ${source.trim()}`);
            fileContent += `${await reader(source)} `;
        }

        if (!fileContent || !fileContent.trim()) {
            const err = new Error(`context ${contextPath} is empty`);
            err.code = 'EEMPTY';
            throw err;
        }

        const lineCount = fileContent.trim().split(/\r\n|\r|\n/).length;
        log.info(`Processed ${lineCount} lines`);

        return fileContent.replace(/[\n\r\t]|\s+/gm, ' ').trim();
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

export { readContext };
