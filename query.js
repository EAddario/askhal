import wrap from 'word-wrap';
import chalk from 'chalk';
import { log } from './log.js';
import { ProviderError } from './errors.js';

/**
 * Queries an AI model with given parameters
 * @param {object} client - Pre-configured OpenAI client instance
 * @param {string} aiModelName - Name of the AI model to use
 * @param {string} systemMessage - System context message
 * @param {string} userPrompt - User query prompt
 * @param {object} options - Query options
 * @param {boolean} options.stream - Whether to stream the output
 * @param {boolean} options.compress - Whether to compress the prompt to fit model's maximum context size
 * @param {object} options.aiParameters - AI fine-tuning parameters
 * @param {function} [options.onOutput] - Callback receiving formatted output text (replaces stdout/log)
 * @param {string} [options.providerName='openrouter'] - Name of the inference provider
 * @returns {Promise<void>}
 * @throws {ProviderError} When AI query fails
 */
async function queryAI(client, aiModelName, systemMessage, userPrompt, { stream, compress, aiParameters, onOutput, providerName = 'openrouter' } = {}) {
    let messages = [{ "role": "user", "content": userPrompt }];

    if (systemMessage)
        messages.unshift({ "role": "system", "content": systemMessage });

    let aiRequest = {
        model: aiModelName,
        messages: messages,
        stream: stream,
        temperature: (aiParameters.TEMPERATURE) && aiParameters.TEMPERATURE,
        top_p: (aiParameters.TOP_P) && aiParameters.TOP_P,
        top_k: (aiParameters.TOP_K) && aiParameters.TOP_K,
        frequency_penalty: (aiParameters.FREQUENCY_PENALTY) && aiParameters.FREQUENCY_PENALTY,
        presence_penalty: (aiParameters.PRESENCE_PENALTY) && aiParameters.PRESENCE_PENALTY,
        repetition_penalty: (aiParameters.REPETITION_PENALTY) && aiParameters.REPETITION_PENALTY,
    };

    if (compress)
        aiRequest.transforms = ["middle-out"];

    try {
        const result = await client.chat.completions.create(aiRequest);

        log.info('');
        if (stream) {
            for await (const chunk of result) {
                const text = chalk.cyanBright(chunk.choices[0].delta.content || '');
                if (onOutput) onOutput(text);
                else process.stdout.write(text);
            }
            log.info('');
        } else {
            const text = wrap(result.choices[0].message.content, { width: 160, indent: '' });
            if (onOutput) onOutput(text);
            else log.message(text);
        }
        log.info('');
    } catch (err) {
        if (err.response) {
            throw new ProviderError(providerName, aiModelName, err.response.status, err.response.data, err.message);
        }
        throw new ProviderError(providerName, aiModelName, err.status || 500, err.error || err, err.message);
    }
}

export { queryAI };