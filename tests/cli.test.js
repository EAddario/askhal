import { expect } from 'chai';
import { execSync } from 'child_process';
import { processCLIArguments } from '../cli.js';
import { InputError } from '../errors.js';

describe('CLI Help Text', () => {
  it('should include --provider option and default', () => {
    const output = execSync('node askhal.js --help', { encoding: 'utf8' });
    expect(output).to.include('--provider');
    expect(output).to.include('default: "openrouter"');
    expect(output).not.to.include('--url');
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

  it('should default to openrouter when no --provider is passed', () => {
    process.argv = ['node', 'askhal.js', '-m', 'model', '-u', 'user'];
    const program = processCLIArguments();
    expect(program.opts().provider).to.equal('openrouter');
  });

  it('should not recognize --url', () => {
    process.argv = ['node', 'askhal.js', '-m', 'model', '-u', 'user', '--url', 'http://test'];
    expect(() => processCLIArguments()).to.throw("error: unknown option '--url'");
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
});
