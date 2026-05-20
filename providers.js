import { ConfigError } from './errors.js';

const PROVIDERS = {
  openrouter: {
    baseURL: 'https://openrouter.ai/api/v1',
    headers: {
      'HTTP-Referer': 'https://github.com/EAddario/askhal',
      'X-Title': 'askhal'
    }
  },
  openai: {
    baseURL: 'https://api.openai.com/v1',
    headers: {}
  },
  anthropic: {
    baseURL: 'https://api.anthropic.com/v1',
    headers: {}
  },
  google: {
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai',
    headers: {}
  },
  together: {
    baseURL: 'https://api.together.xyz/v1',
    headers: {}
  },
  deepseek: {
    baseURL: 'https://api.deepseek.com/v1',
    headers: {}
  }
};

export function resolveProvider(name) {
  const provider = PROVIDERS[name];
  if (!provider) {
    const validProviders = Object.keys(PROVIDERS).join(', ');
    throw new ConfigError(`Unknown provider: ${name}`, `Valid providers are: ${validProviders}`);
  }

  return {
    name,
    baseURL: provider.baseURL,
    headers: { ...provider.headers }
  };
}
