import { expect } from 'chai';
import { checkEnvAPIKey } from '../env.js';
import { ConfigError } from '../errors.js';

describe('checkEnvAPIKey tests', () => {
    it('should throw an error for missing environment variable', () => {
        const envVar = 'ASKHAL_TEST_VARIABLE';

        expect(() => checkEnvAPIKey(envVar)).to.throw(ConfigError, "API Key not defined in environment variable ASKHAL_TEST_VARIABLE");
    });

    it('should return environment variable value', () => {
        const envVar = 'ASKHAL_TEST_VARIABLE';
        const envVal = 'askhal_test_value';
        process.env[envVar] = envVal;

        expect(checkEnvAPIKey(envVar)).to.equal(envVal);
    });
});
