# collab-iot-device

This is a demo repository.
It is a mock IOT device that will emulate data collection from a physical device.
Oauth2 access_token will be obtained from the authorization server using client credential grant type.
Using a timer loop, mock data will be sent to the mock database API.
New access_tokens are obtained as needed from the authorization server.

This is one of 4 repositories

|                        Repository                                  |                   Description                         |
| ------------------------------------------------------------------ | ----------------------------------------------------- |
| collab-auth                                                        | Oauth2 Authorization Provider, redirect login, tokens |
| [collab-frontend](https://github.com/cotarr/collab-frontend)       | Mock Web server, reverse proxy, HTML content          |
| [collab-backend-api](https://github.com/cotarr/collab-backend-api) | Mock REST API using tokens to authorize requests      |
| [collab-iot-device](https://github.com/cotarr/collab-iot-device)   | Mock IOT Device with data acquisition saved to DB     |


### Install

```bash
git clone git@github.com:cotarr/collab-iot-device.git
cd collab-iot-device

npm install
```

### Run

```
npm start
```

### Example Environment variables (showing defaults)

The `.env` file is supported using dotenv npm package

```
APP_PID_FILENAME=/home/user/tmp/collab-iot-device.PID
APP_COLLECT_INTERVAL_SECONDS=60
APP_APP_DISABLE_DATA_COLLECT_TIMER=true

OAUTH2_CLIENT_ID=abc123
OAUTH2_CLIENT_SECRET=ssh-secret
OAUTH2_REQUEST_SCOPE=api.write
OAUTH2_AUTH_URL=http://127.0.0.1:3500

REMOTE_API_URL=http://localhost:4000;
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
Oauth2 supports a token grant type called "Client Credentials&quot grant.
This type of token is sometimes called a machine token, as opposed to a user token.
Before an IOT device can use this method, a client record must be created
in the oauth2 authorization server. The client_id and client_secret are then
placed in the configuration of the IOT device.

Looking at the diagram above, it can be seen that the database API resource server
requires a valid access_token to read or write data to the database.
Therefore, the IOT device must obtain a new valid oauth2 access_token.
The IOT device contacts the authorization server over the network.
Using the IOT device's client credentials, the IOT device will request a new
access token using client credentials grant type. Upon receipt of the token,
the IOT device can gain access to the database API server.

This implementation also supports token scope.
A database may include multiple different tables.
It is useful to provide further granularity so access can be restricted differently
for each database table.
This is done by assigning a scope value to the token,
such as api.read, api.write, or api.admin.
The "api.write" is the intended scope this for this demo.

A second scope is also needed for the authorization server to specificity
the type of token interactions that are allowed to issue token or inquire
token validity. The authorization server in this case accepts possible scopes of
auth.info, auth.token, auth.client.
The "auth.client" designates that the authorization server can
issue tokens directly to a client based on the clientId and
scope, without association with a specific user login.

* "api.write" - Provides access to API routes that allow this scope
* "token.client" - Permits the authentication sever to issue client access_tokens.

The Raspberry Pi or other IOT device would then perform the following steps:

* A cycle timer is created to trigger data acquisition at fixed intervals
* Timer event triggers the IOT device to collect data from it's sensors
* The IOT device checks it's token cache to see if has a non-expired access token
 * If necessary, the IOT device requests a new access_token
 * The new access token is stored in the token cache along with it's expiration time.
*  An HTTP POST request is prepared for transmission to the API database server
*  The access token is attached to the HTTP request Authorization header as a Bearer token.
*  The POST request is sent to the API.
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
