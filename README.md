# collab-iot-device

This is 4 of 4 repositories used on a collaboration project for learning oauth2orize and passport.
The collab-iot-device repository is a mock IOT device that will emulate
data collection from a physical device on a home network.
Oauth2 access_token will be obtained from the authorization server using grant type client credentials.
Using a timer loop, mock data will be periodically sent to a mock database API.
New access_tokens are obtained as needed from the authorization server.

|                        Repository                                  |                   Description                         |
| ------------------------------------------------------------------ | ----------------------------------------------------- |
| [collab-auth](https://github.com/cotarr/collab-auth)               | Oauth2 Authorization Provider, redirect login, tokens |
| [collab-frontend](https://github.com/cotarr/collab-frontend)       | Mock Web server, reverse proxy, HTML content          |
| [collab-backend-api](https://github.com/cotarr/collab-backend-api) | Mock REST API using tokens to authorize requests      |
| [collab-iot-device](https://github.com/cotarr/collab-iot-device)   | Mock IOT Device with data acquisition saved to DB     |

The module [collab-iot-client-token](https://github.com/cotarr/collab-iot-client-token)
was developed specifically to work with this repository (collab-iot-device).
It is available as an npm package 
[@cotarr/collab-iot-client-token](https://www.npmjs.com/package/@cotarr/collab-iot-client-token).
The module will obtain a new Oauth 2.0 access token using client credentials grant.

### Documentation:

https://cotarr.github.io/collab-auth

### Install

Requires NodeJs version 18 or greater

```bash
git clone git@github.com:cotarr/collab-iot-device.git
cd collab-iot-device

npm install
```

### To start the program

In the development environment with NODE_ENV=development or NODE_ENV not specified,
the application should run as-is. No configuration is necessary in development mode.
Alternately, environment variables can be configured as listed at the end of this README,
When the program starts, it will run continuously until stopped by pressing ctrl-C.
The program will obtain an access_token, then using a cycle timer, submit
mock IOT data submissions to the mock database at a repeat interval of 60 seconds.

```
npm start
```

### Example Environment variables

The `.env` file is supported using dotenv npm package. A template "example-.env" file is included.

```
APP_PID_FILENAME=
APP_COLLECT_INTERVAL_SECONDS=60
APP_APP_DISABLE_DATA_COLLECT_TIMER=false

OAUTH2_CLIENT_ID=abc123
OAUTH2_CLIENT_SECRET=ssh-secret
OAUTH2_REQUEST_SCOPE='["api.write"]'
OAUTH2_AUTH_URL=http://127.0.0.1:3500

REMOTE_API_URL=http://localhost:4000;
```

Not supported in .env file

```
# When NODE_ENV=production, console activity log disabled.
NODE_ENV=development
# When NODE_DEBUG_LOG=1, console activity log enabled when in production
NODE_DEBUG_LOG=0
```
# Detail Description

This demonstration is aimed toward using IOT devices on a home network.
One example would be a Raspberry Pi located at various places around the house.
Each Pi may have various sensors, such a outdoor temperature or refrigerator temperature.
For this demonstration 3 temperatures are being emulated.
A random number generator produces simulated temperatures.
New emulated data is generated once per minute.
The emulated IOT device produces JSON encoded data that would look like this:

```
  {
    "deviceId": "iot-device-12",
    "timestamp": "2021-09-17T15:32:08.417Z",
    "data1": 24.831,
    "data2": 27.241,
    "data3": 22.307
  },
```

IOT devices are automated machine devices that operate continuously.
The use of a user login and password is impractical for security
reasons, because each of multiple devices would need to store the user's password.
OAuth2 allows IOT devices operate under their own authority without a user.
Oauth2 supports a token grant type called Client Credentials grant.
This type of token is sometimes called a machine token, as opposed to a user token.
Before an IOT device can use this method, a client record must be created
in the oauth2 authorization server. The client_id and client_secret are then
placed in the configuration of the IOT device.

Looking at the network diagram on the home page, it can be 
seen that the database API resource server
requires a valid access_token to read or write data to the database.
Therefore, the IOT device must obtain a new oauth2 access_token.
The IOT device contacts the authorization server over the network.
Using the IOT device's client credentials, the IOT device will request a new
access token using client credentials grant type. Upon receipt of the token,
the IOT device can gain access to the database API server.

This implementation also supports token scope.
A database may include multiple different tables.
It is useful to provide further granularity so access can be 
restricted differently for each database table.
This is done by assigning a scope value to the token,
such as api.read, api.write, or api.admin.
The "api.write" is the intended scope this for this demo.

A second scope is also needed for the authorization server to access 
the /oauth route. It is used to specify the type of token interactions 
that are allowed, such as to issue new token or validate token status.
The authorization server in this case accepts possible scopes of
auth.info, auth.token, auth.client.
The "auth.client" designates that the authorization server can
issue tokens directly to a client based on the clientId, clientSecret, and
scope, without association with a specific user login.
Combined, the client account allowedScope value should include:

* "api.write" - Provides access to API routes that allow this scope
* "token.client" - Permits the authentication sever to issue client access_tokens.

The Raspberry Pi or other IOT device would then perform the following steps:

* A cycle timer is created to trigger data acquisition at fixed intervals
* Timer event triggers the IOT device to collect data from it's sensors
* The IOT device checks it's token cache to see if has a non-expired access token
  * If necessary, the IOT device requests a new access token which is added to the token cache along with it's expiration time.
* An HTTP POST request is prepared for transmission to the API database server
* The access token is attached to the HTTP request Authorization header as a Bearer token.
* The POST request is sent to the API.
  * The expected HTTP response status is 201 (Created) 
  * 401 Unauthorized response indicates the token is likely expired or otherwise invalid.
  * 403 Forbidden response indicated the client credentials do not have sufficient scope.

Typically the API may add additional default values to the record, such as record ID and timestamps.
The record is returned to the IOT device in the body of the post request as follows.

```
  {
    "id": 1277,
    "deviceId": "iot-device-12",
    "timestamp": "2021-09-17T15:32:08.417Z",
    "data1": 24.831,
    "data2": 27.241,
    "data3": 22.307
    "updatedAt": "2021-09-17T15:33:07.797Z",
    "createdAt": "2021-09-17T15:33:07.797Z"
  },
```

### Try, Fail, Retry Approach

After fetching a new access token, this module will store the token locally
for future use. The cached token may be used for future requests until 
either the token expires or the IOT device is restarted.
For various reasons, it is possible the stored token could 
become revoked or otherwise invalidated at the authorization server. 
This could result in an issue where an unexpired token 
would fail authorization, and continue to fail until the token expires.

The collab-iot-device module will use a javascript object that can be used within 
a chain of Promises such that the object is an argument of each function,
subsequently, the chain object is returned in resolved promise,
in turn to become the next argument. One chain object can keep all 
the state involved in multiple network requests local within 
the chain of promise functions. The sequence would run as follows:

1. An initial call to the `acquire.generateMockDataObject()` begins the process by generating data to emulate the hardware device sensors. The argument of the function `Object.create(null)` is used to create the empty chain object that will pass down the promise chain. The newly acquired data is added to the chain object as the data property.

```
chain {
  data: {
    deviceId: 'iot-device-12',
    timestamp: '2021-09-17T15:33:07.743Z',
    data1: 25.486,
    data2: 25.946,
    data3: 24.609
  }
}
```

2. The function `getClientToken(chain)` is called with the chain object as an argument. In this case a cached token is retrieved from the cache and added to the chain object.

```
chain {
  data: { ... },
  token: {
    accessToken: 'xxxxxx.xxxxxx.xxxxx',
    expires: 1631808644,
    cached: true
  }
}
```

3. A REST API submission function `pushDataToSqlApi(chain)` is called with the chain object as an argument to perform the HTTP submission request using the cached token. The HTTP request fails with 401 Unauthorized. Since the token is cached and failed with 401, it is eligible for a retry. The forceNewToken options property is added to the chain object and set to true. The promise resolves to the chain object.

```
chain {
  data: { ... },
  token: { ... },
  options {
    forceNewToken: true;
  }
}
```

4. The `getClientToken(chain)` is called a second time with the chain object as an argument. The getClientToken detects the forceNewToken flag, ignores the previously cached token. A new access token fetched from the authorization server. 

```
chain {
  data: { ... },
  options: { ... },
  token: {
    accessToken: 'xxxxxx.xxxxxx.xxxxx',
    expires: 1631808644,
    cached: false
  }
}

```
5. The REST API submission function `getClientToken(chain)`is called a second time to retry the submission. This time it succeeds and the promise chain ends.

Alternately, in the case were the first access token was valid, the first 
REST API submission request succeeds, flags can be set to ignore future requests.
Setting `ignoreTokenRequest=true` will instruct the second 
getClientToken() function to ignore the second token request.
Setting `ignoreSqlPush=true` will instruct the second 
pushDataToSqlApi() function to ignore the second data submission.
As the promise chain executes through the second retry steps, 
no further actions are taken.

```
chain {
  data: { ... },
  token: { ... },
  options {
    ignoreTokenRequest: true,
    ignoreSqlPush: true
  }
}
```

The full promise chain will look like this:

```js
// Pass and empty object as argument of initial function, to be the chain object.
acquire.generateMockDataObject(Object.create(null)) // Read sensor, attach data to chain 
  .then((chain) => getClientToken(chain))           // Get cached token, attach to chain object
  .then((chain) => pushDataToSqlApi(chain))         // Submit REST API request using token
  .then((chain) => getClientToken(chain))           // If needed, get another replacement token
  .then((chain) => pushDataToSqlApi(chain))         // If needed, repeat REST API submission
  .catch((err) => console.log(err);
```
