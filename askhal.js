import { processCLIArguments } from './cli.js';
import { checkEnvAPIKey } from './env.js';
import { log } from './log.js';
import { run } from './run.js';
import { resolveProvider } from './providers.js';
import OpenAI from 'openai';

async function main() {
    const program = processCLIArguments();
    const model = program.opts().model;
    const system = program.opts().system;
    const contextPath = program.opts().context;
    const contextType = (program.opts().type).toLowerCase();
    const user = program.opts().user;
    const stream = program.opts().responsive;
    const compress = program.opts().fit;
    const providerName = program.opts().provider;
    const apiKey = (program.opts().key) ? program.opts().key : checkEnvAPIKey('AI_PROVIDER_KEY');

    const providerConfig = resolveProvider(providerName);

    const client = new OpenAI({
        baseURL: providerConfig.baseURL,
        apiKey,
        defaultHeaders: providerConfig.headers
    });

    const aiParameters = {};
    aiParameters.TEMPERATURE = program.opts().temperature;
    aiParameters.TOP_K = program.opts().topk;
    aiParameters.TOP_P = program.opts().topp;
    aiParameters.FREQUENCY_PENALTY = program.opts().frequency;
    aiParameters.REPETITION_PENALTY = program.opts().repetition;
    aiParameters.PRESENCE_PENALTY = program.opts().presence;

    await run(client, model, system, user, { contextPath, contextType, stream, compress, aiParameters, providerName });
}

main()
    .catch((err) => {
        if (typeof err.format === 'function') {
            log.error(err.format());
        } else {
            log.error(err.message);
        }
        process.exit(1);
    });
