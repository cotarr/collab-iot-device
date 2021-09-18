'use strict';

const fetch = require('node-fetch');

const config = require('../config');
// const nodeEnv = process.env.NODE_ENV || 'development';

let cachedToken = null;

/**
 * Convert data object to `thenable` result object
 * than can be used in chained promises.
 *
 * nextResult = {
 *   data: { ... },
 *   token: {
 *     accessToken: 'xxxxxxxxxxxxxxxxxxx',
 *     expires: 1631808644,
 *     cached: true
 *   },
 *   error: false
 * }
 *
 * @param   {Object} data The data object from data aquisition
 * @returns {Object} nextResult chainable object (see above)
 */
exports.dataToObject = (data) => {
  const nextResult = {};
  nextResult.data = data || undefined;
  nextResult.token = undefined;
  nextResult.error = false;
  return Promise.resolve(nextResult);
};

/**
 * Check for oauth2 cached access_token.
 *
 * If parameters `data` or `error` exist they are passed through unchanged
 * The parameter `token` is not expected to contain a value on entry
 *
 * previousResult = {
 *   data: { ... },
 *   token: undefined,
 *   error: false
 * }

 * nextResult = {
 *   data: { ... },
 *   token: {
 *     accessToken: 'xxxxxxxxxxxxxxxxxxx',
 *     expires: 1631808644,
 *     cached: true
 *   },
 *   error: false
 * }
 *
 * @param   {Object} previousResult (see above)
 * @returns {Object} nextResult (see above)
 */

exports.getCachedToken = (previousResult) => {
  if (previousResult.error) {
    return Promise.resolve(previousResult);
  } else {
    const nextResult = {};
    nextResult.data = previousResult.data || undefined;
    nextResult.error = previousResult.error || false;
    nextResult.token = undefined;

    // If cached token is expired, clear it (10 second margin)
    const nowSeconds = Math.floor((new Date().getTime()) / 1000);
    if ((cachedToken == null) ||
      (cachedToken.accessToken == null) ||
      (cachedToken.expires == null) ||
      (cachedToken.expires < nowSeconds + 10)) {
      // Case of expired token, clear expired token
      cachedToken = undefined;
      nextResult.token = undefined;
      // return Promise
      return Promise.resolve(nextResult);
    } else {
      nextResult.token = cachedToken;
      // return Promise
      return Promise.resolve(nextResult);
    }
  }
};

/**
 * Get new access token from authorization server.
 *
 * previousResult = {
 *   data: { ... },
 *   token: undefined,   (or, valid token if exist)
 *   error: false
 * }

 * nextResult = {
 *   data: { ... },
 *   token: {
 *     accessToken: 'xxxxxxxxxxxxxxxxxxx',
 *     expires: 1631808644,
 *     cached: true
 *   },
 *   error: false
 * }
 *
 * @param   {Object} previousResult (see above)
 * @returns {Object} nextResult (see above)
 */
exports.fetchNewTokenIfNeeded = (previousResult) => {
  if (previousResult.error) {
    return Promise.resolve(previousResult);
  } else {
    const nextResult = {};
    nextResult.data = previousResult.data || undefined;
    nextResult.token = previousResult.token || undefined;
    nextResult.error = previousResult.error || false;

    if ((nextResult.token) && (nextResult.token.accessToken) &&
      (nextResult.token.accessToken.length > 0)) {
      // case of token already exist, skip fetch
      return Promise.resolve(nextResult);
    } else {
      // Clear any previously cached token
      cachedToken = undefined;
      // OAuth2 authorization server
      const fetchUrl = config.oauth2.authURL + '/oauth/token';
      // POST request
      const body = {
        client_id: config.oauth2.clientId,
        client_secret: config.oauth2.clientSecret,
        grant_type: 'client_credentials',
        scope: config.oauth2.requestScope
      };
      const fetchOptions = {
        method: 'POST',
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(body)
      };

      // Return Promise
      return fetch(fetchUrl, fetchOptions)
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error('Fetch status ' + response.status + ' ' +
            fetchOptions.method + ' ' + fetchUrl);
          }
        })
        .then((tokenResponse) => {
          // console.log(tokenResponse);
          const nowSeconds = Math.floor((new Date().getTime()) / 1000);
          const token = {
            accessToken: tokenResponse.access_token,
            expires: nowSeconds + parseInt(tokenResponse.expires_in),
            cached: false
          };
          nextResult.token = token;
          return nextResult;
        });
    }
  }
};

/**
 * Save access token to memory cache for future use
 *
 * previousResult = {
 *   data: { ... },
 *     accessToken: 'xxxxxxxxxxxxxxxxxxx',
 *     expires: 1631808644,
 *     cached: true
 *   },
 *   error: false
 * }
 *
 * nextResult = {
 *   data: { ... },
 *   token: { ... },
 *   error: false
 * }
 *
 * @param   {Object} previousResult (see above)
 * @returns {Object} nextResult (see above)
 */
exports.saveTokenIfNeeded = (previousResult) => {
  if (previousResult.error) {
    return Promise.resolve(previousResult);
  } else {
    const nextResult = {};
    nextResult.data = previousResult.data || undefined;
    nextResult.token = previousResult.token || undefined;
    nextResult.error = previousResult.error || false;

    // If token not exit or marked (cached === true), then skip
    if ((nextResult == null) || (!('token' in nextResult)) ||
      (nextResult.token.accessToken == null) ||
      (nextResult.token.cached === true)) {
      // case of no token or token already cached, skip
      return Promise.resolve(nextResult);
    } else {
      // Cache token by saving as module variable
      nextResult.token.cached = true;
      cachedToken = nextResult.token;
      return Promise.resolve(nextResult);
    }
  }
};
