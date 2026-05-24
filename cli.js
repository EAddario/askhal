import { Command } from 'commander';
import packageInfo from './package.json' with { type: "json" };
import { log } from './log.js';
import { InputError } from './errors.js';

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
        throw new InputError(name, value, `between ${min} and ${max}`);
    }

    return parsedValue;
}

function processCLIArguments() {
    const program = new Command();
    program
        .name('askhal')
        .description(`Ask HAL  - Query AI models from various providers\n
           IMPORTANT: The program requires a valid API key to work.
           The API key can be set as an environment variable named AI_PROVIDER_KEY (preferred), or provided as a command
           line argument using the -k or --key option. If both are set, the command line argument will take precedence.`)
        .version(packageInfo.version, '-v, --version', "displays the program's version")
        .usage('--model <name> --user <prompt> [options]')
        .requiredOption('-m, --model <name>', 'name of the AI model to use (required)')
        .requiredOption('-u, --user <prompt>', 'user prompt (required)')
        .option('-s, --system <prompt>', "instructions to guide the model's behavior, set the tone, or specify the desired output")
        .option('-c, --context <file>', "location of a file with additional context. It will be appended at the end of the system's prompt")
        .option('-t, --type <extension>', 'context file type (docx, odt, odp, ods, pdf, pptx, txt, xlsx)', 'txt')
        .option('-f, --fit', "when set, it will compress prompts to fit the model's maximum context size", false)
        .option('-r, --responsive', "when set, it will stream the model's output as it's generated instead of waiting to display all at once", false)
        .option('-p, --provider <name>', 'One of openrouter, openai, anthropic, google, together, or deepseek', 'openrouter')
        .option('--url <url>', 'custom endpoint URL for any OpenAI-compatible API (cannot be used with --provider)')
        .option('-k, --key <value>', 'valid API Key')
        .option('--temperature <value>', 'range from 0.0 to 2.0 (default 1.0)', (value) => parseNumericalValue(value, 'Temperature', 'float', 0.0, 2.0))
        .option('--topk <value>', '0 or higher (default 0)', (value) => parseNumericalValue(value, 'Top-K', 'int', 0, Number.MAX_SAFE_INTEGER))
        .option('--topp <value>', 'range from 0.0 to 1.0 (default 1.0)', (value) => parseNumericalValue(value, 'Top-P', 'float', 0.0, 1.0))
        .option('--frequency <value>', 'range from -2.0 to 2.0 (default 0)', (value) => parseNumericalValue(value, 'Frequency', 'float', -2.0, 2.0))
        .option('--repetition <value>', 'range from 0.0 to 2.0 (default 1.0)', (value) => parseNumericalValue(value, 'Repetition', 'float', 0.0, 2.0))
        .option('--presence <value>', 'range from -2.0 to 2.0 (default 0)', (value) => parseNumericalValue(value, 'Presence', 'float', -2.0, 2.0))
        .addHelpText('after','\nFor more information and usage examples please visit https://github.com/EAddario/askhal\n');

    // Prevent process.exit on parsing errors in tests
    program.exitOverride();

    try {
        if (process.argv.length < 3) {
            program.help()
        }

        program.parse(process.argv);

        const opts = program.opts();
        if (opts.url) {
            if (program.getOptionValueSource('provider') === 'cli') {
                throw InputError.messageOnly("Cannot use --url and --provider together. The --url flag is for custom endpoints (cannot be used with --provider).");
            }
            try {
                new URL(opts.url);
            } catch (err) {
                throw new InputError('url', opts.url, 'a valid URL');
            }
        }
    } catch (err) {
        if (err.code === 'commander.helpDisplayed' || err.code === 'commander.help') {
            process.exit(0);
        }
        throw err;
    }
    return program;
}

export { processCLIArguments };
