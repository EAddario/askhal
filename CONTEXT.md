# CONTEXT.md — askhal

## Project Overview

Ask HAL is a Node.js CLI tool for querying AI models via the [OpenRouter](https://openrouter.ai/) API. It supports system prompts, file/URL context injection, streaming output, prompt compression, and fine-tuning hyperparameters.

- **Version**: 1.6.1
- **License**: MIT
- **Package**: `npm` (ES modules, `"type": "module"`)

## Architecture

```
askhal.js                  — Orchestrator: CLI parse → context read → AI query
  ├── util.js              — CLI arg parsing (commander), logging (chalk), env vars
  ├── processContext.js    — File/URL ingestion (txt, html, office formats)
  └── queryOpenRouter.js   — OpenRouter API call via OpenAI SDK
```

## Source Layout

| File                    | Role                                                                                                  | Key Exports                                    |
|-------------------------|-------------------------------------------------------------------------------------------------------|------------------------------------------------|
| `askhal.js`             | Main entry; wires everything together                                                                 | —                                              |
| `util.js:56`            | `commander` CLI setup, numerical param validation, logging                                            | `processCLIArguments`, `checkEnvAPIKey`, `log` |
| `processContext.js:16`  | Reads context from files (txt, docx, pdf, pptx, xlsx, odt, odp, ods) or URLs (html)                   | `readFile`                                     |
| `queryOpenRouter.js:18` | Creates OpenAI client pointed at OpenRouter, sends chat completions, handles stream/non-stream output | `queryAI`                                      |

## Data Flow

1. `processCLIArguments()` parses args via commander (required: `--model`, `--user`; optional: `--system`, `--context`, `--type`, `--fit`, `--responsive`, `--url`, `--key`, hyperparams)
2. API key resolved: `--key` flag takes precedence, falls back to `OPENROUTER_API_KEY` env var
3. If `--context` is set, `readFile(contextPath, contextType)` parses the source(s) and the result is **appended to the user prompt** (not the system prompt)
4. `queryAI()` creates an `OpenAI` client at `baseURL` (default `https://openrouter.ai/api/v1`), sends `{model, messages, transforms, stream, ...hyperparams}`
5. If `--responsive`: streams chunks via `for await`; otherwise: word-wraps full response to 160 columns

## Supported Context Formats

`processContext.js:7` defines the valid set: `docx`, `html`, `odt`, `odp`, `ods`, `pdf`, `pptx`, `txt`, `xlsx`.

- **txt**: read via `fs.readFile`
- **html**: fetched via `axios`, converted to text with `html-to-text`
- **Office formats**: parsed via `officeparser`
- Multiple comma-separated sources are supported (must be same type)

## Development

```sh
npm install          # Install dependencies
npm test             # Run mocha tests
npm start            # Run askhal.js directly
npm run build        # Bundle with esbuild → bin/askhal.cjs
npm run package      # Package standalone binary with pkg
npm run release      # Clean + build + package
```

### Dependencies

| Package        | Purpose                                                                        |
|----------------|--------------------------------------------------------------------------------|
| `openai`       | OpenAI SDK used to call OpenRouter's chat completions endpoint                 |
| `commander`    | CLI argument parsing                                                           |
| `chalk`        | Colored terminal output (yellow=info, cyan=response, green=success, red=error) |
| `officeparser` | Parse docx, xlsx, pptx, pdf, odt, odp, ods                                     |
| `axios`        | Fetch HTML pages for URL-based context                                         |
| `html-to-text` | Strip HTML tags from fetched pages                                             |
| `word-wrap`    | Wrap AI responses at 160 columns                                               |

### Testing

Tests use **mocha** + **chai** + **chai-as-promised**. Two test files in `tests/`:
- `util.tests.js` — `checkEnvAPIKey` tests
- `processContext.tests.js` — `readFile` tests for valid/invalid/empty/missing files of each supported type

Test assets live in `tests/assets/`. The permission-denied test (`access_denied.txt`) is skipped by default — it requires manual `chmod 000`.

## Docker

Multi-stage build in `Dockerfile`:
1. `node:23-alpine` builder: copies source, runs `npm install`
2. `cgr.dev/chainguard/node:latest` runner: copies `/app` from builder, sets `ENTRYPOINT ["node", "askhal.js"]`

```sh
docker run --rm -it edaddario/askhal --model "openrouter/auto" --user "..." --key=$OPENROUTER_API_KEY
```

## Common Patterns

- All errors propagate through `try/catch` in `main()` and exit with code 1
- Context content is collapsed to a single line (whitespace normalised) before being appended to the user prompt
- When `--fit` is set, OpenRouter's `middle-out` transform strips text from the middle of the prompt to fit the model's context window
