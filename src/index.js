'use strict';

const getToken = require('./get-token');
const acquire = require('./acquire-mock-data');
const pushToSql = require('./push-to-sql');

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

// collectDataAndSave();
