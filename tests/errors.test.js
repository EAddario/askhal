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
      expect(error.format()).to.equal('Unknown provider. Available providers: openai, openrouter');
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
      const error = new ProviderError('openai', 'gpt-4', 429, { error: 'Rate limit exceeded' }, 'Rate limit exceeded');
      expect(error).to.be.an.instanceOf(AskhalError);
      expect(error.name).to.equal('ProviderError');
      expect(error.providerName).to.equal('openai');
      expect(error.modelName).to.equal('gpt-4');
      expect(error.httpStatus).to.equal(429);
      expect(error.responseData).to.deep.equal({ error: 'Rate limit exceeded' });
      expect(error.originalMessage).to.equal('Rate limit exceeded');
    });

    it('should format 429 message correctly', () => {
      const error = new ProviderError('openai', 'gpt-4', 429, { error: 'Rate limit exceeded' }, 'Rate limit exceeded');
      expect(error.format()).to.equal('Rate limited (429) by openai for model gpt-4. Wait and retry.');
    });

    it('should format 401 message correctly', () => {
      const error = new ProviderError('openai', 'gpt-4', 401, { error: 'Unauthorized' }, 'Unauthorized');
      expect(error.format()).to.equal('Authentication failed (401) with openai. Check your AI_PROVIDER_KEY.');
    });

    it('should format 403 message correctly', () => {
      const error = new ProviderError('openai', 'gpt-4', 403, { error: 'Unauthorized' }, 'Access Forbidden');
      expect(error.format()).to.equal('Access Forbidden (403) with openai. You do not have permission to access the resource.');
    });

    it('should format 404 message correctly', () => {
      const error = new ProviderError('openai', 'gpt-4', 404, { error: 'Not Found' }, 'Not Found');
      expect(error.format()).to.equal("Model 'gpt-4' not found on openai. Verify the model identifier.");
    });

    it('should format 500 message correctly', () => {
      const error = new ProviderError('openai', 'gpt-4', 503, { error: 'Service Unavailable' }, 'Service Unavailable');
      expect(error.format()).to.equal('openai returned a server error (503). Try again later.');
    });

    it('should format default message correctly', () => {
      const error = new ProviderError('openai', 'gpt-4', 400, { error: 'Bad Request' }, 'Bad Request');
      expect(error.format()).to.equal('openai error (400) for model gpt-4: Bad Request');
    });
  });
});
