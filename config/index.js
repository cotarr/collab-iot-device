'use strict';

// const path = require('path');

require('dotenv').config();

// const nodeEnv = process.env.NODE_ENV || 'development';

exports.app = {
  pidFilename: process.env.APP_PID_FILENAME || '',
  disableDataCollectTimer: (process.env.APP_DISABLE_DATA_COLLECT_TIMER === 'true') || false
};

exports.oauth2 = {
  clientId: process.env.OAUTH2_CLIENT_ID || 'abc123',
  clientSecret: process.env.OAUTH2_CLIENT_SECRET || 'ssh-secret',
  requestScope: process.env.OAUTH2_REQUEST_SCOPE || 'api.write',
  authURL: process.env.OAUTH2_AUTH_URL || 'http://127.0.0.1:3500',
  tokenCacheSec: process.env.OAUTH2_TOKEN_CACHE_SEC || 60
};

exports.remote = {
  apiURL: process.env.REMOTE_API_URL || 'http://localhost:4000'
};
