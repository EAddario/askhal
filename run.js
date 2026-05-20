import { readContext } from './readContext.js';
import { queryAI } from './query.js';

async function run(client, model, system, user, { contextPath, contextType, stream, compress, aiParameters, providerName } = {}) {
    try {
        if (contextPath)
            user += ` ${await readContext(contextPath, contextType)}`;

    } catch (err) {
        throw err;
    }

    try {
        await queryAI(client, model, system, user, { stream, compress, aiParameters, providerName });
    } catch (err) {
        throw err;
    }
}

export { run };
