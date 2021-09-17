
'use strict';

const fetch = require('node-fetch');

const config = require('../config');
// const nodeEnv = process.env.NODE_ENV || 'development';

/**
 *
 * previousResult = {
 *   data: {
 *   deviceId: 'iot-device-12',
 *   timestamp: '2021-09-17T15:33:07.743Z',
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
 * @returns {Object} nextResult chainable object (see above)
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
            throw new Error('Fetch status ' + response.status + ' ' +
            fetchOptions.method + ' ' + fetchUrl);
          }
        })
        .then((createdRecord) => {
          nextResult.data = createdRecord;
          return nextResult;
        });
    } else {
      nextResult.error = 'NO_TOKEN';
      return Promise.resolve(nextResult);
    }
  }
};
