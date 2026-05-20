import { expect } from 'chai';
import { AskhalError, ConfigError, InputError, ContextError, ProviderError } from '../errors.js';

describe('Error Classes', () => {
  describe('AskhalError', () => {
    it('should extend Error and have the correct message', () => {
      const error = new AskhalError('Base error message');
      expect(error).to.be.an.instanceOf(Error);
      expect(error.message).to.equal('Base error message');
      expect(error.name).to.equal('AskhalError');
    });

    it('should have a format method that returns the message', () => {
      const error = new AskhalError('Base error message');
      expect(error.format()).to.equal('Base error message');
    });
  });

  describe('ConfigError', () => {
    it('should extend AskhalError', () => {
      const error = new ConfigError('Missing API Key', 'Set OPENAI_API_KEY environment variable');
      expect(error).to.be.an.instanceOf(AskhalError);
      expect(error.name).to.equal('ConfigError');
      expect(error.message).to.equal('Missing API Key');
    });

    it('should include remediation instructions in format()', () => {
      const error = new ConfigError('Unknown provider', 'Available providers: openai, openrouter');
      expect(error.format()).to.equal('Unknown provider. Remediation: Available providers: openai, openrouter');
    });
  });

  describe('InputError', () => {
    it('should extend AskhalError', () => {
      const error = new InputError('temperature', 2.5, '0 to 2');
      expect(error).to.be.an.instanceOf(AskhalError);
      expect(error.name).to.equal('InputError');
      expect(error.paramName).to.equal('temperature');
      expect(error.value).to.equal(2.5);
      expect(error.validRange).to.equal('0 to 2');
    });

    it('should format message with paramName, value and validRange', () => {
      const error = new InputError('temperature', 2.5, '0 to 2');
      expect(error.format()).to.equal('Invalid temperature: 2.5. Must be 0 to 2.');
    });
  });

  describe('ContextError', () => {
    it('should extend AskhalError', () => {
      const error = new ContextError('/path/to/file.txt', 'file', 'Permission denied');
      expect(error).to.be.an.instanceOf(AskhalError);
      expect(error.name).to.equal('ContextError');
      expect(error.sourcePath).to.equal('/path/to/file.txt');
      expect(error.contextType).to.equal('file');
      expect(error.reason).to.equal('Permission denied');
    });

    it('should format message naming the source and describing the failure', () => {
      const error = new ContextError('/path/to/file.txt', 'file', 'Permission denied');
      expect(error.format()).to.equal('Failed to read file context from /path/to/file.txt: Permission denied');
    });
  });

  describe('ProviderError', () => {
    it('should extend AskhalError', () => {
      const error = new ProviderError('openai', 'gpt-4', 429, { error: 'Rate limit exceeded' });
      expect(error).to.be.an.instanceOf(AskhalError);
      expect(error.name).to.equal('ProviderError');
      expect(error.providerName).to.equal('openai');
      expect(error.modelName).to.equal('gpt-4');
      expect(error.httpStatus).to.equal(429);
      expect(error.responseData).to.deep.equal({ error: 'Rate limit exceeded' });
    });

    it('should format message with provider, model and status', () => {
      const error = new ProviderError('openai', 'gpt-4', 429, { error: 'Rate limit exceeded' });
      expect(error.format()).to.equal('Provider error (429) from openai for model gpt-4: {"error":"Rate limit exceeded"}');
    });
  });
});
