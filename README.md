# [Ask HAL](https://github.com/EAddario/askhal): A power-user CLI to interact with over 250 AI models!

`askhal` allows you to query all the AI models available in [OpenRouter](https://openrouter.ai/), giving you access to many low-level configuration options. The tool is designed to give users precise control over the model's behavior via context files, system and user prompts, and several fine-tuning parameters.

---

## Table of Contents

1. [Features](#features)
2. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Installation](#installation)
3. [Command-Line Options](#command-line-options)
4. [Usage Examples](#usage-examples)
5. [License](#license)

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

Alternatively, if you have Docker installed, you could use a ready-made [container](https://hub.docker.com/r/edaddario/askhal):

```sh
docker run --rm -it edaddario/askhal --model "openrouter/auto" --user "What is the capital of France?" --key=$OPENROUTER_API_KEY
```

To use a context file you'll need to map the appropriate directories:

```sh
docker run --rm -it -v /path_to_context_directory:/context edaddario/askhal --model "openrouter/auto" --user "Summarize this research paper." --context "/context/research.txt" --type "txt" --key=$OPENROUTER_API_KEY
```

---

## Command-Line Options

Below is a breakdown of the command-line options available for Ask HAL:

| Option                            | Description                                                                                          | Required | Default Value        |
|-----------------------------------|------------------------------------------------------------------------------------------------------|----------|----------------------|
| **-m, --model `<name>`**          | Name of the OpenRouter AI model to query (e.g., `openrouter/auto`)                                   | Yes      | N/A                  |
| **-u, --user `<prompt>`**         | The user query prompt to be sent to the AI model                                                     | Yes      | N/A                  |
| **-s, --system `<prompt>`**       | Instructions for guiding the model's behavior, tone, or specifying the desired output                | No       | N/A                  |
| **-c, --context `<file>/<html>`** | Specifies the file or URL to use as additional context for the query. Multiple sources are possible* | No       | N/A                  |
| **-t, --type `<extension>`**      | Specifies the type of the context file (supports `docx`, `html`, `pdf`, `txt`, etc.)                 | No       | `txt`                |
| **-f, --fit**                     | Enable prompt compression to fit the model's maximum context size**                                  | No       | `false`              |
| **-r, --responsive**              | Streams the model's output as it's generated rather than waiting for the final result                | No       | `false`              |
| **-k, --key `<value>`**           | A valid OpenRouter API key to authenticate queries                                                   | No       | Set via ENV Variable |
| **--temperature `<value>`**       | Adjusts randomness; values range from `0.0` (deterministic) to `2.0` (highly creative)               | No       | `1.0`                |
| **--topk `<value>`**              | Controls diversity by limiting to the top `K` tokens; higher values allow more randomness            | No       | `0`                  |
| **--topp `<value>`**              | Controls diversity by sampling from the top cumulative probability `P`; values from `0.0` to `1.0`   | No       | `1.0`                |
| **--frequency `<value>`**         | Penalizes token frequency in generated results; ranges from `-2.0` to `2.0`                          | No       | `0`                  |
| **--repetition `<value>`**        | Penalizes token repetition in generated results; ranges from `0.0` to `2.0`                          | No       | `1.0`                |
| **--presence `<value>`**          | Penalizes token presence in generated results; ranges from `-2.0` to `2.0`                           | No       | `0`                  |
| **-v, --version**                 | Displays the program's current version                                                               | No       | N/A                  |
| **-h, --help**                    | Displays help information and usage instructions                                                     | No       | N/A                  |

**\*** Multiple context sources are possible by providing a comma separated list e.g. `--context 'file1.txt, file2.txt, file3.txt'`

The files should be of the same type.

**\*\*** If the context exceeds the maximum supported by the chosen model, `askahl` will terminate with an error message along the lines of `This endpoint's maximum context length is X tokens. However, you requested about Y tokens (Y of text input). Please reduce the length of either one, or use the "middle-out" transform to compress your prompt automatically.`

Using the **-f** or **--fit** option will enable OpenRouter's compression algorithm which seemingly removes as much text from the middle of the prompt as it's necessary to fit within the model's limit.

While this seems to be a draconian approach at first (text in the middle simply gets deleted!), it's not without some merit as explained in the [*Lost in the Middle: How Language Models Use Long Contexts*](https://cs.stanford.edu/~nfliu/papers/lost-in-the-middle.arxiv2023.pdf) research paper by *Nelson F. Liu, et al.* however, before enabling this feature please consider the possibility that some/all of the deleted context would have been material to the model's output.

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

Guide the AI model's behavior with a system prompt:

```sh
node askhal.js --model "openrouter/auto" --user "How many pounds are in a kilogram?" --system "You are a chatbot that reluctantly answers questions with sarcastic responses."
```

### Query with Additional Context from a Webpage

Fetch context from a URL (e.g., `www.example.com`) to be included in the system prompt:

```sh
node askhal.js --model "openrouter/auto" --user "Critique the webpage and provide suggestions to improve." --system "You are a web designer reviewing the following webpage:" --context "www.example.com" --type "html"
```

### Query with Additional Context from multiple Files

Append context from several files to be included in the system prompt:

```sh
node askhal.js --model "openrouter/auto" --user "Summarize the research and conclusion." --system "You are a researcher reviewing the following white papers:" --context "research.pdf, ./data/experiment.pdf, ./final/conclusion.pdf" --type "pdf"
```

### Modify AI Behavior with Parameters

Fine-tune the AI behavior using parameters like `temperature`, `topk`, and `topp`.

```sh
node askhal.js --model "openrouter/auto" --user "Write a poem about the sea." --temperature 1.5 --topk 50 --topp 0.9
```

### Stream the Output in Real-Time

Display results as the AI generates them:

```sh
node askhal.js --model "openrouter/auto" --user "Tell me a story about a brave knight." --responsive
```

### Specify API Key via Command-Line

Pass the API key directly:

```sh
node askhal.js --model "openrouter/auto" --user "Translate this to French." --key "sk-or-v1-311..."
```

---

## License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/EAddario/askhal#MIT-1-ov-file) file for details.

---
