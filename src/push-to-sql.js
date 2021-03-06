
'use strict';

const fetch = require('node-fetch');

const config = require('../config');
const nodeEnv = process.env.NODE_ENV || 'development';
const nodeDebugLog = process.env.NODE_DEBUG_LOG || 0;

/**
 *
 * previousResult = {
 *   data: {
 *     deviceId: 'iot-device-12',
 *     timestamp: '2021-09-17T15:33:07.743Z',
 *     data1: 25.486,
 *     data2: 25.946,
 *     data3: 24.609
 *   },
 *
 *   token: xxxxxxx,
 *   error: false
 * }
 *
 * nextResult = {
 *   data: { ... },
 *   token: xxxxxxx,
 *   error: false
 * }
 * @param   {Object} previousResult data object from data aquisition
 * @returns {Promise} nextResult chainable object (see above)
 */
exports.pushDataToSqlApi = (previousResult) => {
  if (previousResult.error) {
    return Promise.resolve(previousResult);
  } else {
    const nextResult = {};
    nextResult.data = previousResult.data || undefined;
    nextResult.token = previousResult.token || undefined;
    nextResult.error = previousResult.error || false;

    if ((!(nextResult == null) && (nextResult.token) &&
      (nextResult.token.accessToken))) {
      const fetchOptions = {
        method: 'POST',
        timeout: 10000,
        headers: {
          'Content-type': 'application/json',
          Accept: 'application/json',
          Authorization: 'Bearer ' + nextResult.token.accessToken
        },
        body: JSON.stringify(nextResult.data, null, 2)
      };

      const fetchUrl = config.remote.apiURL + '/v1/data/iot-data/';

      return fetch(fetchUrl, fetchOptions)
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            // Special case, cached access_token is not yet expired,
            // but, the authorization server is not accepting it.
            // In this case, it may be possible to get a new valid access_token.
            // Instead of throwing an error, proceed forward with error flag
            // set to indicate 401 failure.
            if (response.status === 401) {
              return { error: 'UNAUTHORIZED' };
            } else {
              throw new Error('Fetch status ' + response.status + ' ' +
              fetchOptions.method + ' ' + fetchUrl);
            }
          }
        })
        .then((createdRecord) => {
          // console.log(createdRecord);
          // This is special case error trap of 401 Unauthorized error for possible retry
          if ((!(createdRecord == null)) && ('error' in createdRecord) &&
            (createdRecord.error === 'UNAUTHORIZED')) {
            nextResult.token = undefined;
            nextResult.error = 'UNAUTHORIZED';
            return nextResult;
          } else {
            //
            // Optional: Show activity in log
            //
            if ((nodeEnv === 'development') || (nodeDebugLog)) {
              const now = new Date();
              console.log(now.toISOString() + ' Mock Data (Record id=' + createdRecord.id + ')');
            }

            nextResult.data = createdRecord;
            // This is to skip all other .then in the chain
            nextResult.error = 'NO_ERROR';
            return nextResult;
          }
        });
    } else {
      throw new Error('No access_token');
    }
  }
};
