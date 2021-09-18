'use strict';

const getToken = require('./get-token');
const acquire = require('./acquire-mock-data');
const pushToSql = require('./push-to-sql');

const config = require('../config');

const collectDataAndSave = () => {
  acquire.generateMockDataObject()
    .then((data) => getToken.dataToObject(data))
    .then((resultObj) => getToken.getCachedToken(resultObj))
    .then((resultObj) => getToken.fetchNewTokenIfNeeded(resultObj))
    .then((resultObj) => getToken.saveTokenIfNeeded(resultObj))
    .then((resultObj) => pushToSql.pushDataToSqlApi(resultObj))
    // .then((resultObj) => { console.log(resultObj); })
    .catch((err) => console.log(err));
};

if (!config.app.disableDataCollectTimer) {
  console.log('collab-iot-device started with interval ' +
    config.app.collectIntervalSeconds.toString() + ' seconds.');
  setInterval(collectDataAndSave, config.app.collectIntervalSeconds * 1000);
} else {
  console.log('collab-iot-device timer disabled, runing one time.');
  // timer disabled, call one time in 1 secons
  setTimeout(collectDataAndSave, 1000);
  setTimeout(() => { console.log('Done'); }, 2000);
}
