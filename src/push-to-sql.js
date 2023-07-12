'use strict';

const config = require('../config');

/**
 * Function submits data to external SQL database API route.
 *
 * Function accepts:
 *   chain = {
 *     data: {
 *       deviceId: '123456',
 *       timestamp: '2021-09-17T15:33:07.743Z',
 *       data1: 25.486,
 *       data2: 25.946,
 *       data3: 24.609
 *     },
 *     options: {
 *       ignoreSQLPush: false
 *     }
 *     token: xxxxxxx,
 *   }
 *
 * Function returns
 *   chain = {
 *     options: {
 *       ignoreTokenRequest: true;
 *       ignoreSQLPush: true
 *           .. OR ..
 *       forceNewToken = true;
 *       ignoreSQLPush = false;
 *     }
 *     data: { ... },
 *   }
 *
 * @param {Object} chain - chain object used to pass data between multiple promises.
 * @param {Boolen|undefined} chain.options.ignoreSQLPush (Optional) - If true, do nothing
 * @param {Object} chain.data - Data for submission to be attached as property of chain object
 * @returns {Promise} Resolve to chain object or reject error
 */
exports.pushDataToSqlApi = (chain) => {
  // Option to skip all actions, return chain object without any changes
  // This functionality is intended for a chain of promises
  // where an data has already been submitted successfully
  // and a second re-try attempt is not needed, skipping second submission.
  // ignoreSQLPush is an optional property.
  if ((chain.options) && (chain.options.ignoreSQLPush)) {
    return Promise.resolve(chain);
  } else {
    // Else, not skepped using optional flag property.
    // In a try, fail, then retry scenario, it may still
    // be desired to skip the data submission.
    // This is the case of missing access token.
    // In the case of missing access token, return the chain without changes
    // This will not throw an error.
    if ((chain == null) ||
      (!Object.hasOwn(chain, 'token')) || (chain.token == null) ||
      (!Object.hasOwn(chain.token, 'accessToken')) ||
      (chain.token.accessToken.length === 0)) {
      delete chain.token;
      return Promise.resolve(chain);
    } else {
      // Else, perfrom the data submission to the API server
      //
      // Return promise resolving to chain object, or rejectd error
      return new Promise((resolve, reject) => {
        // Fetch supervisory timer
        const fetchController = new AbortController();
        // SQL database API route for data submission
        const fetchURL = config.remote.apiURL + '/v1/data/iot-data/';
        const fetchOptions = {
          method: 'POST',
          redirect: 'error',
          signal: fetchController.signal,
          headers: {
            'Content-type': 'application/json',
            Accept: 'application/json',
            Authorization: 'Bearer ' + chain.token.accessToken
          },
          body: JSON.stringify(chain.data, null, 2)
        };
        const fetchTimerId = setTimeout(() => fetchController.abort(), 5000);
        fetch(fetchURL, fetchOptions)
          .then((response) => {
            if ((response.status === 200) || (response.status === 201)) {
              return response.json();
            } else {
            // Retrieve error message from remote web server and pass to error handler
              return response.text()
                .then((remoteErrorText) => {
                  const err = new Error('HTTP status error');
                  err.status = response.status;
                  err.statusText = response.statusText;
                  err.remoteErrorText = remoteErrorText;
                  throw err;
                });
            }
          })
          .then((createdRecord) => {
            if (fetchTimerId) clearTimeout(fetchTimerId);
            // console.log(createdRecord);
            //
            // Example response from collab-backend-api
            //   createdRecord {
            //     id: 4,
            //     deviceId: 'iot-device-12',
            //     timestamp: '2023-07-05T13:04:11.548Z',
            //     data1: 26.952,
            //     data2: 27.419,
            //     data3: 26.916,
            //     updatedAt: '2023-07-05T13:04:11.571Z',
            //     createdAt: '2023-07-05T13:04:11.571Z'
            //   }
            //
            // --------------------
            // In a first try, second try chain of promisees
            // set the flags to block a second retry attempt.
            chain.options.ignoreTokenRequest = true;
            chain.options.ignoreSQLPush = true;
            delete chain.options.forceNewToken;
            // Attached the new record to the chain in case the id is needed elsewhere.
            chain.createdRecord = createdRecord;
            resolve(chain);
          })
          .catch((err) => {
            if (fetchTimerId) clearTimeout(fetchTimerId);
            // Build generic error message to catch network errors
            let message = ('Fetch error, ' + fetchOptions.method + ' ' + fetchURL + ', ' +
              (err.message || err.toString() || 'HTTP Error'));
            if (err.status) {
              // Case of HTTP status error, build descriptive error message
              message = ('HTTP status error, ') + err.status.toString() + ' ' +
                err.statusText + ', ' + fetchOptions.method + ' ' + fetchURL;
            }
            if (err.remoteErrorText) {
              message += ', ' + err.remoteErrorText;
            }
            if (err.oauthHeaderText) {
              message += ', ' + err.oauthHeaderText;
            }
            // In a first try, fail, retry scenario,
            // This is the case where a cached token
            // was used, the data submission using that token
            // returned 401 authorized, flags are set
            // to request a new replacement access token,
            // used later in chain of promises.
            if ((Object.hasOwn(chain, 'token')) &&
              (Object.hasOwn(chain.token, 'cached')) &&
              (chain.token.cached === true) &&
              (err.status) && (err.status === 401)) {
              chain.options.forceNewToken = true;
              chain.options.ignoreSQLPush = false;
              resolve(chain);
            } else {
              // Else, not special case, handle the error
              // take only first line of error
              message = message.split('\n')[0];
              const error = new Error(message);
              reject(error);
            }
          });
      }); // new Promise
    } // if no token
  } // if ignore
}; // pushDataToSqlApi()
