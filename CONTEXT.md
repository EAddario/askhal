# CONTEXT.md — askhal

## Project Overview

Ask HAL is a Node.js CLI tool for querying AI models via the [OpenRouter](https://openrouter.ai/) API. It supports system prompts, file/URL context injection, streaming output, prompt compression, and fine-tuning hyperparameters.

- **Version**: 1.23.3
- **License**: MIT
- **Package**: `npm` (ES modules, `"type": "module"`)

## Domain Concepts

- **Context** — additional information appended to the user prompt before querying the AI model. Comes from files, URLs, or office documents.
- **Context Reader** — anything that reads context from a source. Three adapters exist:
  - **Text Context Reader** — reads `txt` files from the local filesystem
  - **Web Context Reader** — fetches `html` from a URL and strips markup
  - **Office Context Reader** — parses `docx`, `odt`, `odp`, `ods`, `pdf`, `pptx`, `xlsx` via officeparser
- **Context Source** — a single file path or URL providing context
- **Context Type** — the format identifier (`docx`, `html`, `odt`, `odp`, `ods`, `pdf`, `pptx`, `txt`, `xlsx`)

## Architecture

```
askhal.js                  — CLI entry: parse args, resolve key, build client
  └── run.js               — Pipeline: context read → concat → AI query
        ├── cli.js         — CLI argument parsing (commander)
        ├── env.js         — API key resolution
        ├── log.js         — Colored console logging (chalk)
        ├── readContext.js — Context dispatcher
        └── queryOpenRouter.js — AI query (OpenAI SDK)
```

## Source Layout

| File                     | Role                                                                                                           | Key Exports           |
|--------------------------|----------------------------------------------------------------------------------------------------------------|-----------------------|
| `askhal.js`              | CLI entry: parses args, resolves API key, constructs OpenAI client, calls `run()`                              | —                     |
| `run.js`                 | Pipeline orchestrator: reads context, appends to prompt, queries AI                                            | `run`                 |
| `cli.js:40`              | `commander` CLI setup, numerical param validation                                                              | `processCLIArguments` |
| `log.js`                 | Colored console logging via chalk (yellow=info, cyan=response, green=success, red=error)                       | `log`                 |
| `env.js`                 | API key resolution from environment variables                                                                  | `checkEnvAPIKey`      |
| `readContext.js`         | Dispatcher: routes to the right Context Reader, handles concatenation, whitespace normalization, error mapping | `readContext`         |
| `textContextReader.js`   | Text Context Reader: reads `txt` files from the local filesystem                                               | `textContextReader`   |
| `webContextReader.js`    | Web Context Reader: fetches `html` from URLs via axios, strips markup via html-to-text                         | `webContextReader`    |
| `officeContextReader.js` | Office Context Reader: parses `docx`, `odt`, `odp`, `ods`, `pdf`, `pptx`, `xlsx` via officeparser              | `officeContextReader` |
| `queryOpenRouter.js:10`  | Sends chat completion request via an injected OpenAI client, handles stream/non-stream output                  | `queryAI`             |

## Data Flow

1. `processCLIArguments()` parses args via commander (required: `--model`, `--user`; optional: `--system`, `--context`, `--type`, `--fit`, `--responsive`, `--url`, `--key`, hyperparams)
2. API key resolved: `--key` flag takes precedence, falls back to `OPENROUTER_API_KEY` env var
3. If `--context` is set, `readContext(contextPath, contextType)` dispatches to the appropriate Context Reader and the result is **appended to the user prompt** (not the system prompt)
4. `main()` constructs an `OpenAI` client with the resolved `baseURL` and `apiKey`, then calls `run()` which passes it to `queryAI()` to send `{model, messages, stream, ...hyperparams}`
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
