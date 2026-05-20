export class AskhalError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AskhalError';
  }

  format() {
    return this.message;
  }
}

export class ConfigError extends AskhalError {
  constructor(message, remediation) {
    super(message);
    this.name = 'ConfigError';
    this.remediation = remediation;
  }

  format() {
    return `${this.message}. Remediation: ${this.remediation}`;
  }
}

export class InputError extends AskhalError {
  constructor(paramName, value, validRange) {
    super(`Invalid ${paramName}: ${value}. Must be ${validRange}.`);
    this.name = 'InputError';
    this.paramName = paramName;
    this.value = value;
    this.validRange = validRange;
  }

  format() {
    return this.message;
  }
}

export class ContextError extends AskhalError {
  constructor(sourcePath, contextType, reason) {
    super(`Failed to read ${contextType} context from ${sourcePath}: ${reason}`);
    this.name = 'ContextError';
    this.sourcePath = sourcePath;
    this.contextType = contextType;
    this.reason = reason;
  }

  format() {
    return this.message;
  }
}

export class ProviderError extends AskhalError {
  constructor(providerName, modelName, httpStatus, responseData) {
    super(`Provider error (${httpStatus}) from ${providerName} for model ${modelName}: ${JSON.stringify(responseData)}`);
    this.name = 'ProviderError';
    this.providerName = providerName;
    this.modelName = modelName;
    this.httpStatus = httpStatus;
    this.responseData = responseData;
  }

  format() {
    return this.message;
  }
}
