const openAI = require('openai');
const wrap = require('word-wrap');
const chalk = require('chalk');
const { log } = require('./util');

/**
 * Queries an AI model with given parameters
 * @param {string} aiModelName - Name of the AI model to use
 * @param {string} systemMessage - System context message
 * @param {string} userPrompt - User query prompt
 * @param {boolean} outputStream - Whether to stream the output
 * @param {string} apiKey - OpenRouter API Key
 * @param {object} aiParameters - AI fine-tuning parameters
 * @returns {Promise<void>}
 * @throws {Error} When AI query fails
 */
async function queryAI(aiModelName, systemMessage, userPrompt, outputStream, apiKey, aiParameters) {
    const client = new openAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: apiKey
    });

    try {
        const result = await client.chat.completions.create({
            model: aiModelName,
            stream: outputStream,
            temperature: (aiParameters.TEMPERATURE) && aiParameters.TEMPERATURE,
            top_p: (aiParameters.TOP_P) && aiParameters.TOP_P,
            top_k: (aiParameters.TOP_K) && aiParameters.TOP_K,
            frequency_penalty: (aiParameters.FREQUENCY_PENALTY) && aiParameters.FREQUENCY_PENALTY,
            presence_penalty: (aiParameters.PRESENCE_PENALTY) && aiParameters.PRESENCE_PENALTY,
            repetition_penalty: (aiParameters.REPETITION_PENALTY) && aiParameters.REPETITION_PENALTY,
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
        log.error(`Error querying model [${aiModelName}] - ${err.message}`);
        if (err.response) {
            log.error(`Status: ${err.response.status}`);
            log.error(`Data: ${JSON.stringify(err.response.data)}`);
        }

        process.exit(1);
    }
}

module.exports = { queryAI };
