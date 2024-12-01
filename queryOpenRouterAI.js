const openAI = require('openai');
const wrap = require('word-wrap');
const chalk = require('chalk');
const { log } = require('./util');

const client = new openAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env['OPENROUTER_API_KEY']
});

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

module.exports = { queryAI };
