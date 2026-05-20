import { log } from './log.js';
import { textContextReader } from './textContextReader.js';
import { webContextReader } from './webContextReader.js';
import { officeContextReader } from './officeContextReader.js';
import { ContextError, InputError } from './errors.js';

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
        throw new ContextError(contextPath, contextType, `unsupported type. Supported types: ${validContextTypes.join(', ')}`);
    }

    try {
        const reader = readers[contextType];
        const sources = contextPath.split(',');
        let fileContent = '';

        for (const source of sources) {
            log.info(`Reading ${source.trim()}`);
            fileContent += `${await reader(source.trim())} `;
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
        if (err instanceof ContextError) throw err;
        
        let reason = err.message;

        if (err.code === 'ENOENT') {
            reason = 'not found';
        } else if (err.code === 'EACCES') {
            reason = 'permission denied. Please check your file permissions';
        } else if (err.code === 'EEMPTY') {
            reason = 'empty';
        } else if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
            reason = 'connection timeout';
        } else if (err.code === 'ERR_NETWORK') {
            reason = 'network error';
        } else if (err.code === 'ERR_BAD_RESPONSE') {
            reason = 'cannot parse response';
        } else if (err.code === 'ERR_BAD_REQUEST' || err.code === 'ERR_INVALID_URL') {
            reason = 'invalid path or URL';
        }

        throw new ContextError(contextPath, contextType, reason);
    }
}

export { readContext };
