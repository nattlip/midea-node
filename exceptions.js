


class MideaError extends Error {
  constructor(message) {
    super(message);
    this.name = 'MideaError';
  }
}

class MideaNetworkError extends MideaError {
  constructor(message) {
    super(message);
    this.name = 'MideaNetworkError';
  }
}

class ProtocolError extends MideaError {
  constructor(message) {
    super(message);
    this.name = 'ProtocolError';
  }
}

class UnsupportedError extends MideaError {
  constructor(message) {
    super(message);
    this.name = 'UnsupportedError';
  }
}

class AuthenticationError extends MideaError {
  constructor(message) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

class CloudError extends MideaError {
  constructor(errorCode, message) {
    super(message);
    this.name = 'CloudError';
    this.errorCode = errorCode;
  }

  toString() {
    return `Midea cloud API error: ${ this.message } (${ this.errorCode })`;
  }
}

class CloudRequestError extends MideaError {
  constructor(message) {
    super(message);
    this.name = 'CloudRequestError';
  }
}

class RetryLaterError extends MideaError {
  constructor(errorCode, message) {
    super(message);
    this.name = 'RetryLaterError';
    this.errorCode = errorCode;
  }

  toString() {
    return `Retry later: ${ this.message } (${ this.errorCode })`;
  }
}

class CloudAuthenticationError extends MideaError {
  constructor(errorCode, message, account) {
    super(message);
    this.name = 'CloudAuthenticationError';
    this.errorCode = errorCode;
    this.account = account;
  }

  toString() {
    return `Cloud authentication error: ${ this.message } (${ this.errorCode })`;
  }
}
```

//In JavaScript, the standard `Error` class is extended to create custom exception classes.The `name` property is set for each class to mimic the class hierarchy in Python.The`toString` method is overridden to provide a custom string representation of the error.