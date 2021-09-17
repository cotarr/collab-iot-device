# collab-iot-device

# collab-backend-api

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

The `.env` file is supported.

```
APP_PID_FILENAME=/home/user/tmp/collab-iot-device.PID
APP_DISABLE_DATA_COLLECT_TIMER=true

OAUTH2_CLIENT_ID || 'abc123',
OAUTH2_CLIENT_SECRET || 'ssh-secret',
OAUTH2_REQUEST_SCOPE || 'api.write',
OAUTH2_AUTH_URL=http://127.0.0.1:3500
OAUTH2_TOKEN_CACHE_SEC=60

REMOTE_API_URL='http://localhost:4000';
```
