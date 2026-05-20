import { expect } from 'chai';
import { resolveProvider } from '../providers.js';
import { ConfigError } from '../errors.js';

describe('Provider Registry', () => {
  it('should return correct config for openai', () => {
    const config = resolveProvider('openai');
    expect(config).to.deep.equal({
      name: 'openai',
      baseURL: 'https://api.openai.com/v1',
      headers: {}
    });
  });

  it('should return correct config for openrouter', () => {
    const config = resolveProvider('openrouter');
    expect(config).to.deep.equal({
      name: 'openrouter',
      baseURL: 'https://openrouter.ai/api/v1',
      headers: {
        'HTTP-Referer': 'https://github.com/EAddario/askhal',
        'X-Title': 'askhal'
      }
    });
  });

  it('should return correct config for anthropic', () => {
    const config = resolveProvider('anthropic');
    expect(config).to.deep.equal({
      name: 'anthropic',
      baseURL: 'https://api.anthropic.com/v1',
      headers: {}
    });
  });

  it('should return correct config for google', () => {
    const config = resolveProvider('google');
    expect(config).to.deep.equal({
      name: 'google',
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai',
      headers: {}
    });
  });

  it('should return correct config for together', () => {
    const config = resolveProvider('together');
    expect(config).to.deep.equal({
      name: 'together',
      baseURL: 'https://api.together.xyz/v1',
      headers: {}
    });
  });

  it('should return correct config for deepseek', () => {
    const config = resolveProvider('deepseek');
    expect(config).to.deep.equal({
      name: 'deepseek',
      baseURL: 'https://api.deepseek.com/v1',
      headers: {}
    });
  });

  it('should throw ConfigError with valid providers for unknown provider', () => {
    expect(() => resolveProvider('foobar')).to.throw(ConfigError, 'Unknown provider: foobar');
    try {
      resolveProvider('foobar');
    } catch (error) {
      expect(error.remediation).to.include('openai');
      expect(error.remediation).to.include('openrouter');
      expect(error.remediation).to.include('anthropic');
      expect(error.remediation).to.include('google');
      expect(error.remediation).to.include('together');
      expect(error.remediation).to.include('deepseek');
    }
  });
});
