import { expect } from 'chai';
import { execSync } from 'child_process';

describe('CLI Help Text', () => {
  it('should include --provider option and default', () => {
    const output = execSync('node askhal.js --help', { encoding: 'utf8' });
    expect(output).to.include('--provider');
    expect(output).to.include('default: "openrouter"');
    expect(output).not.to.include('--url');
  });
});
