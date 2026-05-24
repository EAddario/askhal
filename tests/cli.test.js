import { expect } from 'chai';
import { execSync } from 'child_process';
import { processCLIArguments } from '../cli.js';
import { InputError } from '../errors.js';

describe('CLI Help Text', () => {
  it('should include --provider option and default', () => {
    const output = execSync('node askhal.js --help', { encoding: 'utf8' });
    expect(output).to.include('--provider');
    expect(output).to.include('default: "openrouter"');
    expect(output).to.include('--url');
  });

  it('should use provider-agnostic language', () => {
    const output = execSync('node askhal.js --help', { encoding: 'utf8' });
    expect(output).not.to.include('OpenRouter AI model');
    expect(output).not.to.include('OPENROUTER_API_KEY');
    expect(output).to.include('AI_PROVIDER_KEY');
    expect(output).to.include('Query AI models');
    expect(output).not.to.include('models available in OpenRouter');
  });
});

describe('CLI Arguments Parsing', () => {
  let originalArgv;

  beforeEach(() => {
    originalArgv = process.argv;
  });

  afterEach(() => {
    process.argv = originalArgv;
  });

  it('should set provider to openai when --provider openai is passed', () => {
    process.argv = ['node', 'askhal.js', '-m', 'model', '-u', 'user', '--provider', 'openai'];
    const program = processCLIArguments();
    expect(program.opts().provider).to.equal('openai');
  });

  describe('--url flag', () => {
    it('should set url when --url is passed', () => {
      process.argv = ['node', 'askhal.js', '-m', 'model', '-u', 'user', '--url', 'http://localhost:11434/v1'];
      const program = processCLIArguments();
      expect(program.opts().url).to.equal('http://localhost:11434/v1');
    });

    it('should not be present in opts when not passed', () => {
      process.argv = ['node', 'askhal.js', '-m', 'model', '-u', 'user'];
      const program = processCLIArguments();
      expect(program.opts().url).to.be.undefined;
    });

    it('should work fine with --url and default provider', () => {
      process.argv = ['node', 'askhal.js', '-m', 'model', '-u', 'user', '--url', 'http://localhost:11434/v1'];
      const program = processCLIArguments();
      expect(program.opts().url).to.equal('http://localhost:11434/v1');
      expect(program.opts().provider).to.equal('openrouter');
    });

    it('should throw InputError when --url is malformed', () => {
      process.argv = ['node', 'askhal.js', '-m', 'model', '-u', 'user', '--url', 'not-a-url'];
      expect(() => processCLIArguments()).to.throw(InputError);
      try {
        processCLIArguments();
      } catch (err) {
        expect(err.name).to.equal('InputError');
        expect(err.format()).to.include('Invalid url: not-a-url');
      }
    });

    it('should throw InputError with messageOnly when both --url and --provider are explicit', () => {
      process.argv = ['node', 'askhal.js', '-m', 'model', '-u', 'user', '--url', 'http://localhost:11434/v1', '--provider', 'openai'];
      expect(() => processCLIArguments()).to.throw(InputError);
      try {
        processCLIArguments();
      } catch (err) {
        expect(err.name).to.equal('InputError');
        expect(err.paramName).to.be.undefined;
        expect(err.format()).to.include('cannot be used with --provider');
      }
    });
  });

  it('should default to openrouter when no --provider is passed', () => {
    process.argv = ['node', 'askhal.js', '-m', 'model', '-u', 'user'];
    const program = processCLIArguments();
    expect(program.opts().provider).to.equal('openrouter');
  });

  it('should throw ConfigError formatting for invalid provider', () => {
    try {
      execSync('node askhal.js -m model -u user -k fakekey --provider foobar', { encoding: 'utf8', stdio: 'pipe' });
      expect.fail('Should have failed');
    } catch (error) {
      const output = error.stderr || error.message || error.stdout;
      expect(output).to.include('Unknown provider: foobar');
      expect(output).to.include('Valid providers are:');
    }
  });

  describe('Custom Endpoint wiring', () => {
    it('should bypass resolveProvider and format ProviderError as "custom" when --url is set', () => {
      try {
        execSync('node askhal.js -m test -u test -k test --url http://127.0.0.1:0/v1', { encoding: 'utf8', stdio: 'pipe' });
        expect.fail('Should have failed');
      } catch (error) {
        const output = error.stderr || error.message || error.stdout;
        expect(output).to.include('custom returned a server error');
      }
    });
  });
});
