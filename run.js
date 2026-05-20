import { readContext } from './readContext.js';
import { queryAI } from './query.js';
import { log } from './log.js';

async function run(client, model, system, user, { contextPath, contextType, stream, compress, aiParameters } = {}) {
    try {
        if (contextPath)
            user += ` ${await readContext(contextPath, contextType)}`;

    } catch (err) {
        log.error("could not process context file");
        throw err;
    }

    try {
        await queryAI(client, model, system, user, { stream, compress, aiParameters });
    } catch (err) {
        log.error("could not query AI model");
        throw err;
    }
}

export { run };
