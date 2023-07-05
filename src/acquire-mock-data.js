'use strict';
//
// The purpose of this module is to emulate a home IOT device
// such as a Raspberry Pi that may be connected to various sensors.
// In this case, 3 emulated sensors are read, returning
// a number in the range of 22.500 to 27.500 that would be typical
// of a temperature sensor.
//

const deviceId = 'iot-device-12';

/**
 * Generate a random number in the range 22.500 to 27.500
 * @returns {Number} Return mock data of type number
 */
const _generateOneMockData = () => {
  return Math.floor(22500 + (Math.random() * 5000)) / 1000;
};

/**
 * Mock data acquisition to generate an emulated data collection event
 * Example:
 * {
 *   deviceId: 'iot-device-12',
 *   timestamp: '2021-09-17T15:33:07.743Z',
 *   data1: 25.486,
 *   data2: 25.946,
 *   data3: 24.609
 * }
 * @returns {Promise} resolved with mock data and timestamp
 */
exports.generateMockDataObject = (chain) => {
  if (chain == null) chain = Object.create(null);
  return new Promise((resolve) => {
    const timeNowInSeconds = new Date().toISOString();
    chain.data = {
      deviceId: deviceId,
      timestamp: timeNowInSeconds,
      data1: _generateOneMockData(),
      data2: _generateOneMockData(),
      data3: _generateOneMockData()
    };
    resolve(chain);
  });
};
