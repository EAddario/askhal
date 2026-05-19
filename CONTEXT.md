# CONTEXT.md — askhal

Ask HAL is a Node.js CLI tool for querying AI language models. It supports system prompts, file/URL context injection, streaming output, prompt compression, and fine-tuning hyperparameters.

## Language

**Provider**:
An AI inference service that exposes an OpenAI-compatible chat completions API.
_Avoid_: vendor, backend, endpoint

**Provider Name**:
The canonical identifier for a built-in provider (openrouter, openai, anthropic, groq, together, deepseek).
_Avoid_: provider ID, backend name

**API Key**:
The authentication credential for the selected Provider, set via the `ASKHAL_API_KEY` environment variable or `--key` flag. A single key works across all Providers.
_Avoid_: token, secret, password

**Model**:
An AI language model exposed by a Provider, identified by a model name string (e.g. `openai/gpt-4o`, `claude-sonnet-4-20250514`).

**Context**:
Additional information appended to the user prompt before querying the model. Sourced from files, URLs, or office documents.
_Avoid_: prompt suffix, attachment

**Context Source**:
A single file path or URL that provides context. Multiple comma-separated sources are supported (must share the same context type).

**Context Type**:
The format identifier for a context source (`docx`, `html`, `odt`, `odp`, `ods`, `pdf`, `pptx`, `txt`, `xlsx`).

**Context Reader**:
An adapter that reads a Context Source of a given Context Type and returns plain text. Three readers exist: text (local `.txt` files), web (URLs via HTTP), and office (document formats via officeparser).

**Prompt Compression**:
When enabled via `--fit`, the Provider's API-level transform strips text from the middle of the prompt to fit the model's context window.

**Streaming Response**:
When enabled via `--responsive`, model output is written to stdout chunk-by-chunk as it is generated, rather than waiting for the full response.

## Relationships

- A **Provider** exposes one or more **Models**
- A **Context Source** has exactly one **Context Type**
- A **Context Reader** handles one or more related **Context Types**
- An **API Key** authenticates with exactly one **Provider** per invocation
- **Context** is appended to the user prompt (not the system prompt) before querying the **Model**

## Example dialogue

> **Dev:** "Can I use the same API key for openai and anthropic?"
> **Domain expert:** "No — `ASKHAL_API_KEY` authenticates with whichever Provider you select via `--provider`. Each Provider expects its own credential. To switch Providers, change the key and the `--provider` flag."
>
> **Dev:** "What happens if I pass a docx and a pdf as context?"
> **Domain expert:** "Both are supported — they share the same Context Type group (office formats) and use the same Context Reader. If you tried mixing `txt` and `html`, that would fail because a single invocation uses one Context Type."

## Flagged ambiguities

- "model" was used interchangeably with "provider" in past documentation — resolved: a **Provider** is the service; a **Model** is a specific AI model within that service.
- "key" and "API key" were both used — resolved: **API Key** is the canonical term.
