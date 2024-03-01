//Certainly! Here's the equivalent Node.js code for the provided Python library:

   // ```javascript
const { MideaCloud, LanDevice, findAppliances, applianceState } = require('midea-beautiful');

const DEFAULT_APPKEY = 'defaultAppKey';
const DEFAULT_APP_ID = 'defaultAppId';
const DEFAULT_HMACKEY = 'defaultHmacKey';
const DEFAULT_IOTKEY = 'defaultIotKey';
const DEFAULT_API_SERVER_URL = 'defaultApiServerUrl';
const DEFAULT_PROXIED = 'defaultProxied';
const DEFAULT_RETRIES = 3;
const DEFAULT_TIMEOUT = 10;
const DEFAULT_SIGNKEY = 'defaultSignKey';
const SUPPORTED_APPS = {
  defaultApp: {
    appkey: DEFAULT_APPKEY,
    appid: DEFAULT_APP_ID,
    apiurl: DEFAULT_API_SERVER_URL,
    hmackey: DEFAULT_HMACKEY,
    iotkey: DEFAULT_IOTKEY,
    proxied: DEFAULT_PROXIED,
    signkey: DEFAULT_SIGNKEY,
  },
};

const version = require('midea-beautiful/version');

const logger = console; // Replace with your logger implementation

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

function connectToCloud(
  account,
  password,
  { appkey = DEFAULT_APPKEY, appid = DEFAULT_APP_ID, appname = null, hmackey = DEFAULT_HMACKEY, iotkey = DEFAULT_IOTKEY, apiurl = DEFAULT_API_SERVER_URL, proxied = DEFAULT_PROXIED, sign_key = DEFAULT_SIGNKEY } = {}
) {
  if (appname !== null) {
    const app = SUPPORTED_APPS[appname];
    appkey = app.appkey;
    appid = app.appid;
    apiurl = app.apiurl;
    hmackey = app.hmackey;
    iotkey = app.iotkey;
    proxied = app.proxied;
    sign_key = app.signkey;
  }

  const cloud = new MideaCloud({
    appkey,
    account,
    password,
    appid,
    hmac_key: hmackey,
    iot_key: iotkey,
    api_url: apiurl,
    proxied,
    sign_key,
  });

  cloud.authenticate();
  return cloud;
}

function findAppliances({
  cloud = null,
  appkey = null,
  account = null,
  password = null,
  appid = null,
  addresses = ['255.255.255.255'],
  appliances = null,
  retries = DEFAULT_RETRIES,
  timeout = DEFAULT_TIMEOUT,
  appname = null,
  hmackey = DEFAULT_HMACKEY,
  iotkey = DEFAULT_IOTKEY,
  api_url = DEFAULT_API_SERVER_URL,
  proxied = DEFAULT_PROXIED,
  sign_key = DEFAULT_SIGNKEY,
} = {}) {
  if (appname !== null) {
    const app = SUPPORTED_APPS[appname];
    appkey = app.appkey;
    appid = app.appid;
    api_url = app.apiurl;
    hmackey = app.hmackey;
    iotkey = app.iotkey;
    proxied = app.proxied;
    sign_key = app.signkey;
  }

  logger.debug(`Library version = ${ version.__version__ } `);

  if (!cloud && account && password) {
    cloud = connectToCloud({
      account,
      password,
      appname,
      appkey,
      appid,
      hmackey,
      iotkey,
      api_url,
      proxied,
      sign_key,
    });
  }

  logger.debug(`Scanning for midea dehumidifier appliances via ${ addresses } `);
  return doFindAppliances(cloud, addresses, appliances, { max_retries: retries, timeout });
}

function doFindAppliances(cloud, addresses, appliances, { max_retries, timeout }) {
  // Implementation of doFindAppliances - Replace with actual implementation
  return [];
}

module.exports = {
  applianceState,
  connectToCloud,
  findAppliances,
  LanDevice,
  MideaCloud,
};
```

//Please note that this code assumes the existence of the `doFindAppliances` function, which needs to be implemented based on the
//actual functionality provided by your Node.js library or the `midea-beautiful` library you are using.Additionally, 
//make sure to replace the `logger` implementation with your own logging mechanism.