# [Ask HAL](https://github.com/EAddario/askhal): A power-user tool to interact with over 250 AI models!

`askhal` allows you to query all the AI models available in [OpenRouter](https://openrouter.ai/), giving you access to many low-level configuration options. The tool is designed to give users precise control over the model's behavior via context files, system and user prompts, and several fine-tuning parameters.

---

## Table of Contents

1. [Features](#features)
2. [Getting Started](#getting-started)
3. [Command-Line Options](#command-line-options)
4. [Usage Examples](#usage-examples)
5. [Error Handling](#error-handling)

---

## Features

- Query over 250 [AI models](https://openrouter.ai/models) available in OpenRouter.
- Add a system prompt to provide specific instructions to the model.
- Enhance the AI's responses by including additional context stored in a file. `askhal` currently supports `docx`, `odt`, `odp`, `ods`, `pdf`, `pptx`, `txt`, and `xlsx` files.
- Configure the model's behavior using [hyper-parameters](https://docs.novelcrafter.com/en/articles/8677980-tuning-your-model-settings) like temperature, top-k and top-p sampling, frequency penalty, etc.
- Stream results as they are generated or wait for the entire output to display
- Supports OpenRouter API integration via environment variable or command-line option.

---

## Getting Started

### Prerequisites

1. A valid **OpenRouter** account. You can sign up [here*](https://openrouter.ai/). The free account allows you to query over [20 models](https://openrouter.ai/models?max_price=0), although some restrictions will apply (e.g. max 20 requests per minute and up to 200 requests per model per day).  
2. A valid OpenRouter [API key](https://openrouter.ai/settings/keys). There are two ways to configure it for `askhal` to work:
    - Set the key as an environment variable named **OPENROUTER_API_KEY** (e.g.: `export OPENROUTER_API_KEY="sk-or-v1-311..."`). This is the **recommended** approach, or
    - Pass it directly via the `-k` / `--key` command-line option. This value will take precedence even if you have the environment variable set

3. [Node.js](https://nodejs.org/en) installed on your system.

***Note 1**: As you'll expect, the most capable models require you to use a paid account, but costs for individual use tend to be rather low. For example, the [OpenAI'a GPT-4o](https://openrouter.ai/openai/gpt-4o-2024-11-20) model costs less than \$0.0001 per token, which is roughly \$0.01 for a 100-word response. During the initial `askhal` development and testing phase, the total cost was less than $1.50

***Note 2**: The program's author **is not affiliated** with OpenRouter and **does not** receive any compensation for promoting their services. 

### Installation

Clone the repository and install the required dependencies:

```sh
git clone https://github.com/EAddario/askhal.git
cd askhal
npm install
```

---

## Command-Line Options

Below is a breakdown of the command-line options available for Ask HAL:

| Option                       | Description                                                                                         | Required | Default Value        |
|------------------------------|-----------------------------------------------------------------------------------------------------|----------|----------------------|
| **-m, --model `<name>`**     | Name of the OpenRouter AI model to query (e.g., `openrouter/auto`).                                 | Yes      | N/A                  |
| **-u, --user `<prompt>`**    | The user query prompt to be sent to the AI model.                                                   | Yes      | N/A                  |
| **-s, --system `<prompt>`**  | Instructions for guiding the model's behavior, tone, or specifying the desired output.              | No       | N/A                  |
| **-c, --context `<file>`**   | Specifies a file (e.g., `.docx`, `.pdf`, `.txt`) to include as additional context for the query.    | No       | N/A                  |
| **-t, --type `<extension>`** | Specifies the type of the context file (supports `docx`, `pdf`, `txt`, etc.).                       | No       | `txt`                |
| **-r, --responsive**         | Streams the model's output as it's generated rather than waiting for the final result.              | No       | `false`              |
| **-k, --key `<value>`**      | A valid OpenRouter API key to authenticate queries.                                                 | No       | Set via ENV Variable |
| **--temperature `<value>`**  | Adjusts randomness; values range from `0.0` (deterministic) to `2.0` (highly creative).             | No       | `1.0`                |
| **--topk `<value>`**         | Controls diversity by limiting to the top `K` tokens; higher values allow more randomness.          | No       | `0`                  |
| **--topp `<value>`**         | Controls diversity by sampling from the top cumulative probability `P`; values from `0.0` to `1.0`. | No       | `1.0`                |
| **--frequency `<value>`**    | Penalizes token frequency in generated results; ranges from `-2.0` to `2.0`.                        | No       | `0`                  |
| **--repetition `<value>`**   | Penalizes token repetition in generated results; ranges from `0.0` to `2.0`.                        | No       | `1.0`                |
| **--presence `<value>`**     | Penalizes token presence in generated results; ranges from `-2.0` to `2.0`.                         | No       | `0`                  |
| **-v, --version**            | Displays the current version of Ask HAL.                                                            | No       | N/A                  |
| **-h, --help**               | Displays help information and usage instructions.                                                   | No       | N/A                  |

---

## Usage Examples

The examples below use [`openrouter/auto`](https://openrouter.ai/openrouter/auto), a meta-model that automatically selects the 'best' model based on your prompt's size and complexity. OpenRouter's documentation is lacking regarding how a model is actually chosen, but they invariably require a paid account. To use the free tier, just replace with one from [this list](https://openrouter.ai/models?max_price=0).

### Display help

Show program's help and options

```sh
node askhal.js --version
```

### Basic Query

Query the AI model with a user prompt only:

```sh
node askhal.js --model "openrouter/auto" --user "What is the capital of France?"
```

### Query with a System Prompt

Guide AI model behavior with a system prompt:

```sh
node askhal.js --model "openrouter/auto" --user "Summarize this article" --system "Provide a concise summary in bullet points."
```

### Query with Additional Context from a File

Append context from a file (e.g., `research.txt`) to the system prompt:

```sh
node askhal.js --model "openrouter/auto" --user "Summarize this research paper." --system "Summarize in bullet points." --context "./research.txt" --type "txt"
```

### Modify AI Behavior with Parameters

Fine-tune the AI behavior using parameters like `temperature`, `topk`, and `topp`.

```sh
node askhal.js --model "openrouter/auto" --user "Write a poem about the sea." --temperature 1.5 --topk 50 --topp 0.9
```

### Stream the Output in Real-Time

Fetch results as the AI generates them:

```sh
node askhal.js --model "openrouter/auto" --user "Tell me a story about a brave knight." --responsive
```

### Specify API Key via Command-Line

Pass the API key directly:

```sh
node askhal.js --model "openrouter/auto" --user "Translate this to French." --key "sk-or-v1-311..."
```

---

## Error Handling

- If required options (`--model`, `--user`) are missing, the program will terminate and display an error message.
- If the specified context file type is invalid, the program will list all supported file types and exit.
- API key authentication errors result in a relevant error message and program termination.

---
