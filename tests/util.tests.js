const { expect } = require('chai');
const { checkEnvAPIKey } = require('../util');

describe('util tests', () => {
    it('should throw an error for invalid environment variable value', () => {
        const envVar = 'ASKHAL_TEST_VARIABLE';

        expect(() => checkEnvAPIKey(envVar)).to.throw("OpenRouter API Key not defined in environment variable");
    });

    it('should return environment variable value', () => {
        const envVar = 'ASKHAL_TEST_VARIABLE';
        const envVal = 'askhal_test_value';
        process.env[envVar] = envVal;

        expect(checkEnvAPIKey(envVar)).to.equal(envVal);
    });
});
