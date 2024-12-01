const chalk = require('chalk');

/**
 * Simple logging utility
 * @type {{success: (function(*): void)}}
 * @type {{error: (function(*): void)}}
 * @type {{message: (function(*): void)}}
 * @type {{info: (function(*): void)}}
 */
const log = {
    info: (msg) => console.log(chalk.yellowBright(msg)),
    error: (msg) => console.error(chalk.redBright(msg)),
    success: (msg) => console.log(chalk.greenBright(msg)),
    message: (msg) => console.log(chalk.cyanBright(msg))
};

/**
 * Check if API Key is defined, otherwise terminate the program
 * @param {string} env – Required API Key to proceed
 */
function checkAPIKey(env) {
    if (!process.env[env]) {
        log.error("Error: OpenRouter API Key not defined in environment variable. Program terminated.");
        process.exit(1);
    }
}

module.exports = { log, checkAPIKey };
