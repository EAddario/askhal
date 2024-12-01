const fs = require('fs').promises;
const officeParser = require('officeparser');
const openAI = require('openai');
const chalk = require('chalk');
const wrap = require('word-wrap');

const validFileTypes = ['docx', 'odt', 'odp', 'ods', 'pdf', 'pptx', 'txt', 'xlsx'];
const log = {
    info: (msg) => console.log(chalk.yellowBright(msg)),
    error: (msg) => console.error(chalk.redBright(msg)),
    success: (msg) => console.log(chalk.greenBright(msg)),
    message: (msg) => console.log(chalk.cyanBright(msg))
};

if (!process.env['OPENROUTER_API_KEY']) {
    log.error("Error: OpenRouter API Key not defined in environment variable. Program terminated.");
    process.exit(1);
}

const client = new openAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env['OPENROUTER_API_KEY']
});

/**
 * Reads a file from the file system
 * @param inputFilePath
 * @param inputFileType
 * @returns {Promise<string|*>}
 * @throws {Error} When file type is invalid or file is empty
 */
async function readFile(inputFilePath, inputFileType) {
    if (!validFileTypes.includes(inputFileType)) {
        log.error(`Error: ${inputFileType} is not a valid file type`);
        log.error(`Program only supports the following file types: ${validFileTypes.join(', ')}`);
        process.exit(1);
    }

    try {
        const fileContent = (inputFileType === 'txt')
            ? await fs.readFile(inputFilePath, 'utf8')
            : await officeParser.parseOfficeAsync(inputFilePath);

        if (!fileContent || !fileContent.trim()) {
            throw new Error(`Error: file ${inputFilePath} is empty`);
        }

        const lineCount = fileContent.trim().split(/\r\n|\r|\n/).length;
        log.info(`Processed ${lineCount} lines`);
        return fileContent;
    } catch (err) {
        log.error(`Error reading file ${inputFilePath}`);
        throw err;
    }
}

/**
 * Queries an AI model with given parameters
 * @param {string} aiModelName - Name of the AI model to use
 * @param {string} systemMessage - System context message
 * @param {string} userPrompt - User query prompt
 * @param {boolean} outputStream - Whether to stream the output
 * @returns {Promise<void>}
 * @throws {Error} When AI query fails
 */
async function queryAI(aiModelName, systemMessage, userPrompt, outputStream) {
    try {
        const result = await client.chat.completions.create({
            model: aiModelName,
            stream: outputStream,
            // temperature: TEMPERATURE,
            // top_p: TOP_P,
            // top_k: TOP_K,
            // frequency_penalty: FREQUENCY_PENALTY,
            // presence_penalty: PRESENCE_PENALTY,
            // repetition_penalty: REPETITION_PENALTY,
            messages: [
                { "role": "system", "content": systemMessage },
                { "role": "user", "content": userPrompt }
            ]
        });

        log.info('');
        if (outputStream) {
            for await (const chunk of result) {
                process.stdout.write(chalk.cyanBright(chunk.choices[0].delta.content || ''));
            }
            log.info('');
        } else {
            const iaModelResponse = wrap(result.choices[0].message.content, { width: 160, indent: '' });
            log.message(iaModelResponse);
        }
        log.info('');
    } catch (err) {
        log.error(`Error querying the AI model: ${aiModelName}`);
        throw err;
    }
}

/**
 * Main function
 * @param {string} aiModelName - Name of the AI model to use
 * @param {string} inputFilePath - Path to the input file
 * @param {string} inputFileType - Type of the input file
 * @param {boolean} outputStream - Whether to stream the output
 * @returns {Promise<void>}
 * @throws {Error} When file reading or AI query fails
 */
async function main(aiModelName, inputFilePath, inputFileType, outputStream) {
    try {
        const context = await readFile(inputFilePath, inputFileType);
        let systemMessage = `You are an experienced developer tasked with code reviewing the following program: ${context}`;
        let userPrompt =    "Generate a joke that relates to the program above";

        await queryAI(aiModelName, systemMessage, userPrompt, outputStream);
    } catch (err) {
        log.error("Error executing program");
        throw err;
    }
}

// const aiModelName = 'openrouter/auto';
const aiModelName = 'liquid/lfm-40b:free';
const inputFilePath = './askhal.js';
const inputFileType = 'txt';
const outputStream = true;
// const TEMPERATURE = 1.0;        // Range: [0, 2]
// const TOP_P = 1.0;              // Range: (0, 1]
// const TOP_K = 0;                // Range: [0, Infinity) Not available for OpenAI models
// const FREQUENCY_PENALTY = 0;    // Range: [-2, 2]
// const PRESENCE_PENALTY = 0;     // Range: [-2, 2]
// const REPETITION_PENALTY = 1.0; // Range: (0, 2]

/**
 * Program entry point
 */
main(aiModelName, inputFilePath, inputFileType, outputStream)
    .then(() => log.success("Program completed successfully"))
    .catch(err => {
        log.error(`Program Error: ${err}`);
        process.exit(1);
    });
