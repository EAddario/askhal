const { checkAPIKey, log, processCLIArguments } = require('./util');
const { readFile } = require('./processContextFile');
const { queryAI } = require('./queryOpenRouterAI');

/**
 * Main function
 * @returns {Promise<void>}
 * @throws {Error} When file reading or AI query fails
 */
async function main() {
    const program = processCLIArguments();
    const aiModelName = program.opts().model;
    const contextFilePath = program.opts().context;
    let systemPrompt = program.opts().system;
    const userPrompt = program.opts().user;
    const contextFileType = program.opts().type;
    const streamOutput = program.opts().responsive;
    const apiKey = program.opts().key ? program.opts().key : checkAPIKey('OPENROUTER_API_KEY');

    let aiParameters = {};
    aiParameters['TEMPERATURE'] = program.opts().temperature;
    aiParameters['TOP_K'] = program.opts().topk;
    aiParameters['TOP_P'] = program.opts().topp;
    aiParameters['FREQUENCY_PENALTY'] = program.opts().frequency;
    aiParameters['REPETITION_PENALTY'] = program.opts().repetition;
    aiParameters['PRESENCE_PENALTY'] = program.opts().presence;

    try {
        const context = (contextFilePath) && await readFile(contextFilePath, contextFileType);
        systemPrompt += ` ${context}`;

        await queryAI(aiModelName, systemPrompt, userPrompt, streamOutput, apiKey, aiParameters);
    } catch (err) {
        log.error("Error executing program");
        throw err;
    }
}

/**
 * Program entry point
 */
main()
    .then(() => log.success("Program completed successfully"))
    .catch(err => {
        log.error(`Program Error: ${err}`);
        process.exit(1);
    });
