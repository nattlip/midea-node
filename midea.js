

const { createDecipheriv, createHash, createCipheriv, randomBytes } = require('crypto');
const { unpad } = require('crypto-padding');

const MSGTYPE_HANDSHAKE_REQUEST = 0x0;
const MSGTYPE_HANDSHAKE_RESPONSE = 0x1;
const MSGTYPE_ENCRYPTED_RESPONSE = 0x3;
const MSGTYPE_ENCRYPTED_REQUEST = 0x6;
const MSGTYPE_TRANSPARENT = 0xF;

const DISCOVERY_PORT = 6445;

const INTERNAL_KEY = Buffer.from(
  "c8aa6c57402cac8b5674db84acc89be82c704362da72b5ff21544b483b50d39c",
  'hex'
);

const _BLOCKSIZE = 16;

function decryptInternal(data) {
  const encryptedData = Buffer.from(data, 'hex');
  const decipher = createDecipheriv('aes-256-ecb', INTERNAL_KEY, null);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');

  const hash = createHash('sha256').update(INTERNAL_KEY).digest();
  const iv = hash.slice(0, 16);

  const decipherCBC = createDecipheriv('aes-256-cbc', INTERNAL_KEY, iv);
  decrypted = decipherCBC.update(encryptedData, 'hex', 'utf-8');
  decrypted += decipherCBC.final('utf-8');

  return unpad(Buffer.from(decrypted, 'utf-8')).toString('utf-8');
}

const SUPPORTED_APPS = {
  "NetHome Plus": {
    "appkey": "3742e9e5842d4ad59c2db887e12449f9",
    "appid": 1017,
    "apiurl": "https://mapp.appsmb.com",
    "signkey": "xhdiwjnchekd4d512chdjx5d8e4c394D2D7S",
    "proxied": null,
  },
  "Midea Air": {
    "appkey": "ff0cf6f5f0c3471de36341cab3f7a9af",
    "appid": 1117,
    "apiurl": "https://mapp.appsmb.com",
    "signkey": "xhdiwjnchekd4d512chdjx5d8e4c394D2D7S",
    "proxied": null,
  },
  "MSmartHome": {
    "appkey": "ac21b9f9cbfe4ca5a88562ef25e2b768",
    "appid": 1010,
    "apiurl": "https://mp-prod.appsmb.com/mas/v5/app/proxy?alias=",
    "signkey": "xhdiwjnchekd4d512chdjx5d8e4c394D2D7S",
    "iotkey": decryptInternal("f4dcd1511147af45775d7e680ac5312b"),
    "hmackey": decryptInternal("5018e65c32bcec087e6c01631d8cf55398308fc19344d3e130734da81ac2e162"),
    "proxied": "v5",
  },
};

const DEFAULT_APP = "NetHome Plus";
const DEFAULT_APPKEY = SUPPORTED_APPS[DEFAULT_APP]["appkey"];
const DEFAULT_APP_ID = SUPPORTED_APPS[DEFAULT_APP]["appid"];
const DEFAULT_API_SERVER_URL = SUPPORTED_APPS[DEFAULT_APP]["apiurl"];
const DEFAULT_SIGNKEY = SUPPORTED_APPS[DEFAULT_APP]["signkey"];
const DEFAULT_HMACKEY = SUPPORTED_APPS[DEFAULT_APP]["hmackey"];
const DEFAULT_IOTKEY = SUPPORTED_APPS[DEFAULT_APP]["iotkey"];
const DEFAULT_PROXIED = SUPPORTED_APPS[DEFAULT_APP]["proxied"];

const DEFAULT_RETRIES = 3;
const DEFAULT_TIMEOUT = 3;

const ERROR_CODE_P2 = 38;
const ERROR_CODE_BUCKET_FULL = ERROR_CODE_P2;
const ERROR_CODE_BUCKET_REMOVED = 37;

const APPLIANCE_TYPE_DEHUMIDIFIER = "0xa1";
const APPLIANCE_TYPE_AIRCON = "0xac";

const AC_MIN_TEMPERATURE = 16;
const AC_MAX_TEMPERATURE = 31;

//Please note that Node.js doesn't have a built-in padding module, so I've used the `crypto-padding` library for padding.You can install it using:

//  
//npm install crypto-padding
//```