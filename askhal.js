const { checkEnvAPIKey, log, processCLIArguments } = require('./util.js');
const { readFile } = require('./processContext.js');
const { queryAI } = require('./queryOpenRouter.js');

/**
 * Main function
 * @returns {Promise<void>}
 * @throws {Error} When file reading or AI query fails
 */
async function main() {
    const program = processCLIArguments();
    const aiModelName = program.opts().model;
    let systemPrompt = program.opts().system;
    const contextFilePath = program.opts().context;
    const contextFileType = (program.opts().type).toLowerCase();
    const userPrompt = program.opts().user;
    const streamOutput = program.opts().responsive;
    const compressPrompt = program.opts().fit;
    const apiKey = (program.opts().key) ? program.opts().key : checkEnvAPIKey('OPENROUTER_API_KEY');

    /**
     * @typedef {Object} AIParameters
     * @property {number} [TEMPERATURE] - Range: [0.0, 2.0]. Controls the randomness of the generated text.
     * @property {number} [TOP_P] - Range: [0.0, 1.0]. Controls the diversity of the generated text.
     * @property {number} [TOP_K] - Range: [1, Infinity). Controls the diversity of the generated text.
     * @property {number} [FREQUENCY_PENALTY] - Range: [-2.0, 2.0]. Penalizes the frequency of a token in the generated text.
     * @property {number} [PRESENCE_PENALTY] - Range: [-2.0, 2.0]. Penalizes the presence of a token in the generated text.
     * @property {number} [REPETITION_PENALTY] - Range: [0.0, 2.0]. Penalizes the repetition of a token in the generated text.
     */
    let aiParameters = {};
    aiParameters.TEMPERATURE = program.opts().temperature;
    aiParameters.TOP_K = program.opts().topk;
    aiParameters.TOP_P = program.opts().topp;
    aiParameters.FREQUENCY_PENALTY = program.opts().frequency;
    aiParameters.REPETITION_PENALTY = program.opts().repetition;
    aiParameters.PRESENCE_PENALTY = program.opts().presence;

    let context;
    try {
        if (contextFilePath)
            context = await readFile(contextFilePath, contextFileType);

        if (systemPrompt)
            systemPrompt = (context) ? systemPrompt + ` ${context}` : systemPrompt;

    } catch (err) {
        log.error("could not process context file");
        throw err;
    }

    try {
        await queryAI(aiModelName, systemPrompt, userPrompt, streamOutput, compressPrompt, apiKey, aiParameters);

    } catch (err) {
        log.error("could not query AI model");
        throw err;
    }
}

/**
 * Program entry point
 */
main()
    .catch((err) => {
        log.error(`Program terminated with error code '${err.code}'\n${err.message} `);
        process.exit(1);
    });
