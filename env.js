import { log } from './log.js';

function checkEnvAPIKey(env) {
    if (!process.env[env]) {
        log.error("OpenRouter API Key not defined in environment variable");
        throw new Error("OpenRouter API Key not defined in environment variable");
    }

    return process.env[env];
}

export { checkEnvAPIKey };
