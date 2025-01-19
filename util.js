import chalk from 'chalk';
import { program } from 'commander';
import packageInfo from './package.json' with { type: "json" };

/**
 * Simple logging utility
 * @type {{success: (function(*): void)}}
 * @type {{error: (function(*): void)}}
 * @type {{message: (function(*): void)}}
 * @type {{info: (function(*): void)}}
 */
const log = {
    info: (msg) => console.log(chalk.yellowBright(msg)),
    message: (msg) => console.log(chalk.cyanBright(msg)),
    success: (msg) => console.log(chalk.greenBright(msg)),
    error: (msg) => console.error(chalk.redBright(msg))
};

/**
 * Check if API Key is defined, otherwise terminate the program
 * @param {string} env – Required API Key to proceed
 */
function checkEnvAPIKey(env) {
    if (!process.env[env]) {
        log.error("OpenRouter API Key not defined in environment variable");
        throw new Error("OpenRouter API Key not defined in environment variable");
    }

    return process.env[env];
}

function parseNumericalValue(value, name, type, min, max) {
    const parsedValue = (() => {
        switch (type) {
            case 'int':
                return parseInt(value);
            case 'float':
                return parseFloat(value);
            default:
                return value;
        }
    })();

    if (isNaN(parsedValue) || parsedValue < min || parsedValue > max) {
        log.error(`${name} must be between ${min} and ${max}`);
        throw new Error(`${name} must be between ${min} and ${max}`);
    }

    return parsedValue;
}

/**
 * Process command line arguments
 * @returns {Object}
 */
function processCLIArguments() {
    program
        .name('askhal')
        .description(`Ask HAL  - Query AI models available in OpenRouter (https://openrouter.ai/)\n
           IMPORTANT: The program requires a valid OpenRouter API key to work.
           The API key can be set as an environment variable named OPENROUTER_API_KEY (preferred), or provided as a command
           line argument using the -k or --key option. If both are set, the command line argument will take precedence.`)
        .version(packageInfo.version, '-v, --version', "displays the program's version")
        .usage('--model <name> --user <prompt> [options]')
        .requiredOption('-m, --model <name>', 'name of the OpenRouter AI model to use (required)') // openrouter/auto
        .requiredOption('-u, --user <prompt>', 'user prompt (required)')
        .option('-s, --system <prompt>', "instructions to guide the model's behavior, set the tone, or specify the desired output")
        .option('-c, --context <file>', "location of a file with additional context. It will be appended at the end of the system's prompt")
        .option('-t, --type <extension>', 'context file type (docx, odt, odp, ods, pdf, pptx, txt, xlsx)', 'txt')
        .option('-f, --fit', "when set, it will compress prompts to fit the model's maximum context size", false)
        .option('-r, --responsive', "when set, it will stream the model's output as it's generated instead of waiting to display all at once", false)
        .option('-k, --key <value>', 'valid OpenRouter API Key')
        .option('--temperature <value>', 'range from 0.0 to 2.0 (default 1.0)', (value) => parseNumericalValue(value, 'Temperature', 'float', 0.0, 2.0))
        .option('--topk <value>', '0 or higher (default 0)', (value) => parseNumericalValue(value, 'Top-K', 'int', 0, Number.MAX_SAFE_INTEGER))
        .option('--topp <value>', 'range from 0.0 to 1.0 (default 1.0)', (value) => parseNumericalValue(value, 'Top-P', 'float', 0.0, 1.0))
        .option('--frequency <value>', 'range from -2.0 to 2.0 (default 0)', (value) => parseNumericalValue(value, 'Frequency', 'float', -2.0, 2.0))
        .option('--repetition <value>', 'range from 0.0 to 2.0 (default 1.0)', (value) => parseNumericalValue(value, 'Repetition', 'float', 0.0, 2.0))
        .option('--presence <value>', 'range from -2.0 to 2.0 (default 0)', (value) => parseNumericalValue(value, 'Presence', 'float', -2.0, 2.0))
        .addHelpText('after','\nFor more information and usage examples please visit https://github.com/EAddario/askhal\n');

    if (process.argv.length < 3) {
        program.help()
    }

    program.parse(process.argv);
    return program;
}

export { checkEnvAPIKey, log, processCLIArguments };
