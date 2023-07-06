'use strict';
// ------------------------------------------------------------------------
// The collab-iot-device repository is a mock IOT device that will emulate
// data collection from a physical device on a home network.
// Oauth2 access_token will be obtained from the authorization server
// using grant type client credentials. Using a timer loop, mock data will
// be periodically sent to a mock database API. New access_tokens are
// obtained as needed from the authorization server.
// ------------------------------------------------------------------------

const { getClientToken, authInit } = require('@cotarr/collab-iot-client-token');
const acquire = require('./acquire-mock-data');
const { pushDataToSqlApi } = require('./push-to-sql');

const config = require('../config');

const nodeEnv = process.env.NODE_ENV || 'development';

//
// Initialize the token module configuration on program start
//
authInit({
  authURL: config.oauth2.authURL,
  clientId: config.oauth2.clientId,
  clientSecret: config.oauth2.clientSecret,
  requestScope: config.oauth2.requestScope
});

/**
 * Inserting this optional debug function into the promise chain
 * can be used to show progression of data added to the chain object.
 *
 * @Example
 * acquire.generateMockDataObject(Object.create(null))
 *   .then((chain) => getClientToken(chain))
 *   .then((chain) => debugShowChain(chain)) // <-------
 *   .then((chain) => pushDataToSqlApi(chain))
 * @param   {Object} chain (Optional) - chain object used to pass data between multiple promises.
 * @returns {Promise} resolves to chain object containing new access token, or rejects error
*/
// eslint-disable-next-line no-unused-vars
const debugShowChain = (chain) => {
  // console.log(JSON.stringify(chain, null, 2));
  if ((nodeEnv === 'development') || (process.env.SHOW_DEBUG_LOG === 1)) {
    const nowSeconds = Math.floor((new Date().getTime()) / 1000);
    const expiresInSeconds = chain.token.expires - nowSeconds;
    console.log('token expires in ' + expiresInSeconds.toString() +
    ' seconds, (cached=' + chain.token.cached + ')');
  }
  return Promise.resolve(chain);
};

/**
 * Function to be called by repetitive timer to submit mock data to emulated backend SQL database.
 */
const collectDataAndSave = () => {
  acquire.generateMockDataObject(Object.create(null))
    // First try (cached token if available)
    .then((chain) => getClientToken(chain))
    .then((chain) => pushDataToSqlApi(chain))
    // Second try (skipped internally if not needed)
    .then((chain) => getClientToken(chain))
    .then((chain) => pushDataToSqlApi(chain))
    // show result with console.log (when NODE_ENV===development)
    .then((chain) => debugShowChain(chain))
    .catch((err) => console.log(err.message || err.toString() || 'Error'));
};

//
// To disable timer, performing the data submission one time,
// Terminal bash command:
//   APP_DISABLE_DATA_COLLECT_TIMER=true node src/index.js
//
if (!config.app.disableDataCollectTimer) {
  // Case of NOT disabled, use the timer
  const now = new Date();
  console.log(now.toISOString() + ' collab-iot-device started with interval ' +
    config.app.collectIntervalSeconds.toString() + ' seconds.');

  // do first time at program start
  setTimeout(collectDataAndSave, 1000);
  setInterval(collectDataAndSave, config.app.collectIntervalSeconds * 1000);
} else {
  // Else, perform one time and exit.
  const now = new Date();
  console.log(now.toISOString() + ' collab-iot-device timer disabled, running one time.');
  // timer disabled, call one time in 1 seconds
  setTimeout(collectDataAndSave, 1000);
  setTimeout(() => { console.log('Done'); }, 2000);
}
