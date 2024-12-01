const { program } = require('commander');
const { log, checkAPIKey } = require('./util');
const { readFile } = require('./processContextFile');
const { queryAI } = require('./queryOpenRouterAI');

checkAPIKey('OPENROUTER_API_KEY');

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

        await queryAI(aiModelName, systemMessage, userPrompt, outputStream, aiParameters);
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
let aiParameters = {};

/**
 * Program entry point
 */
main(aiModelName, inputFilePath, inputFileType, outputStream)
    .then(() => log.success("Program completed successfully"))
    .catch(err => {
        log.error(`Program Error: ${err}`);
        process.exit(1);
    });
