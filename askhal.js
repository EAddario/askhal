import { checkEnvAPIKey, log, processCLIArguments } from './util.js';
import { run } from './run.js';
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
    const apiKey = (program.opts().key) ? program.opts().key : checkEnvAPIKey('OPENROUTER_API_KEY');
    const baseURL = program.opts().url;

    const client = new OpenAI({
        baseURL,
        apiKey,
        defaultHeaders: {
            "HTTP-Referer": "https://github.com/EAddario/askhal",
            "X-Title": "Ask HAL"
        }
    });

    const aiParameters = {};
    aiParameters.TEMPERATURE = program.opts().temperature;
    aiParameters.TOP_K = program.opts().topk;
    aiParameters.TOP_P = program.opts().topp;
    aiParameters.FREQUENCY_PENALTY = program.opts().frequency;
    aiParameters.REPETITION_PENALTY = program.opts().repetition;
    aiParameters.PRESENCE_PENALTY = program.opts().presence;

    await run(client, model, system, user, { contextPath, contextType, stream, compress, aiParameters });
}

main()
    .catch((err) => {
        log.error(`Program terminated with error code '${err.code}'\n${err.message} `);
        process.exit(1);
    });
