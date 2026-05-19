import { readContext } from './readContext.js';
import { queryAI } from './queryOpenRouter.js';
import { log } from './util.js';

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
