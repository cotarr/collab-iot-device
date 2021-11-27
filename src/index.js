'use strict';

const getToken = require('./get-token');
const acquire = require('./acquire-mock-data');
const pushToSql = require('./push-to-sql');

const config = require('../config');

const collectDataAndSave = () => {
  acquire.generateMockDataObject()
    .then((data) => getToken.dataToObject(data))
    // Get access_token
    .then((resultObj) => getToken.getCachedToken(resultObj))
    .then((resultObj) => getToken.fetchNewTokenIfNeeded(resultObj))
    .then((resultObj) => getToken.saveTokenIfNeeded(resultObj))
    // First try
    .then((resultObj) => pushToSql.pushDataToSqlApi(resultObj))
    // Get replacement access token if needed (or skip)
    .then((resultObj) => getToken.setupOptionalReplacementToken(resultObj))
    .then((resultObj) => getToken.fetchNewTokenIfNeeded(resultObj))
    .then((resultObj) => getToken.saveTokenIfNeeded(resultObj))
    // .then((resultObj) => { console.log('resultObj ', resultObj); return resultObj; })
    // Second try if needed (or skip)
    .then((resultObj) => pushToSql.pushDataToSqlApi(resultObj))
    // .then((resultObj) => { console.log(resultObj); })
    .catch((err) => console.log(err));
};

if (!config.app.disableDataCollectTimer) {
  const now = new Date();
  console.log(now.toISOString() + ' collab-iot-device started with interval ' +
    config.app.collectIntervalSeconds.toString() + ' seconds.');

  // do first time at program start
  setTimeout(collectDataAndSave, 1000);
  setInterval(collectDataAndSave, config.app.collectIntervalSeconds * 1000);
} else {
  const now = new Date();
  console.log(now.toISOString() + ' collab-iot-device timer disabled, runing one time.');
  // timer disabled, call one time in 1 seconds
  setTimeout(collectDataAndSave, 1000);
  setTimeout(() => { console.log('Done'); }, 2000);
}
