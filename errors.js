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
    return `${this.message}. ${this.remediation}`;
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
  constructor(providerName, modelName, httpStatus, responseData, message = '') {
    super(`Provider error (${httpStatus}) from ${providerName} for model ${modelName}: ${JSON.stringify(responseData)}`);
    this.name = 'ProviderError';
    this.providerName = providerName;
    this.modelName = modelName;
    this.httpStatus = httpStatus;
    this.responseData = responseData;
    this.originalMessage = message;
  }

  format() {
    if (this.httpStatus === 429) {
      return `Rate limited (${this.httpStatus}) by ${this.providerName} for model ${this.modelName}. Wait and retry.`;
    }
    if (this.httpStatus === 401) {
      return `Authentication failed (${this.httpStatus}) with ${this.providerName}. Check your AI_PROVIDER_KEY.`;
    }
    if (this.httpStatus === 403) {
      return `Access Forbidden (${this.httpStatus}) with ${this.providerName}. You do not have permission to access the resource.`;
    }
    if (this.httpStatus === 404) {
      return `Model '${this.modelName}' not found on ${this.providerName}. Verify the model identifier.`;
    }
    if (this.httpStatus >= 500 && this.httpStatus < 600) {
      return `${this.providerName} returned a server error (${this.httpStatus}). Try again later.`;
    }
    return `${this.providerName} error (${this.httpStatus}) for model ${this.modelName}: ${this.originalMessage}`;
  }
}
