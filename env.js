import { log } from './log.js';
import { ConfigError } from './errors.js';

function checkEnvAPIKey(env) {
    if (!process.env[env]) {
        throw new ConfigError(`API Key not defined in environment variable ${env}`, `Set the ${env} environment variable`);
    }

    return process.env[env];
}

export { checkEnvAPIKey };
