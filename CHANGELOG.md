# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v1.0.2](https://github.com/cotarr/collab-iot-device/releases/tag/v1.0.2) - 2023-07-08

This is a minor message format change to align with the collab-auth /docs/ description.

- In src/push-to-sql added response from POST request to the chain object to make record id available.
- Updated debug console log message to show the id value of created record, token as new or cached, and time until token expires.

## [v1.0.1](https://github.com/cotarr/collab-iot-device/releases/tag/v1.0.1) - 2023-07-07

### Fixed

- Fixed environment variable NODE_DEBUG_LOG not parsed correctly.

## [v1.0.0](https://github.com/cotarr/collab-iot-device/releases/tag/v1.0.0) - 2023-07-06

BREAKING CHANGE (after v0.0.7) require Node 18 or greater. Incremented major version from 0 to 1

Upgrade to node 18 allows use of internal native NodeJS fetch() API. 
The node-fetch repository used previously has moved on to provide an ES Module 
specific release that does not support CommonJS modules.
Use of the internal node fetch API removes reliance on the legacy node-fetch v2 dependency.

- Set minimum version NodeJs to node 18 or greater, added node version check in config/index.js.
- Remove npm module node-fetch, now using node internal fetch() API.

Split this into two repositories, one to emulate the IOT device, one to fetch access tokens.

- The src/get-token.js module was removed from this repository to create separate npm module.
- Created new repository (collab-iot-client-token)[https://github.com/cotarr/collab-iot-client-token]
- Create new npm repository (@cotarr/collab-iot-client-token )[https://www.npmjs.com/package/@cotarr/collab-iot-client-token]

General code clean up and comments

- Rename some module variables to more descriptive names related to chain.
- Upgrade logic for conditional operations along the promise chain.
- Overall code clean up and improved comments.
- In code, now using Object.hasOwn to test if keys properties exist in an object, replacing `in` operator, or boolean check on key name.
- In various places, create new objects with Object.create(null), replacing object literal
- Rewrite fetch() network HTTP requests to include supervisory timer and in case of status errors, retrieve error HTTP error content from remote server.
- Bump dotenv@16.3.1, node-fetch@2.6.12 to clean npm outdated warnings.
- Re-install eslint, manual install semver@7.5.3, delete and regenerate package-lock.json in v3 format to clear npm audit warning.

## [v0.0.7](https://github.com/cotarr/collab-iot-device/releases/tag/v0.0.7) - 2023-01-11

The npm security advisory for debug package has been updated to 
to incorporate backport debug@2.6.9 as safe. Manual edit of package-lock.json is 
no longer required.

- Deleted package-lock.json. Ran npm install to create a new package-lock.json.

## [v0.0.6](https://github.com/cotarr/collab-iot-device/releases/tag/v0.0.6) - 2023-01-11

- Deleted package-lock.json, re-installed eslint and dependencies.
- package-lock.json - Manually upgrade eslint-plugin-import dependency to debug@4.3.4 to clear dependabot alert.
- eslintrc.js - update rules to match changes in eslint upgrade.

## [v0.0.5](https://github.com/cotarr/collab-iot-device/releases/tag/v0.0.5) - 2022-11-15

### Changed

- package-lock.json - Bumped minimatach v3.0.4 to v3.1.2, npm audit fix to address github dependabot alert.

## [v0.0.4](https://github.com/cotarr/collab-iot-device/releases/tag/v0.0.4) - 2022-07-12

## Changed

- Update dotenv 16.0.0 to 16.0.1

## [v0.0.3](https://github.com/cotarr/collab-iot-device/releases/tag/v0.0.3) - 2022-03-30

### Changed

- GitHub dependabot pull request to bump minimist from 1.2.5 to 1.2.6 to address prototype pollution
- Update dotenv to v16.0.0

## [v0.0.2](https://github.com/cotarr/collab-iot-device/releases/tag/v0.0.2) - 2022-01-22

### Changed

- Update node-fetch to v2.6.7 to address github advisory

## [v0.0.1](https://github.com/cotarr/collab-iot-device/releases/tag/v0.0.1) - 2021-12-26

### Changed

- Set tag v0.0.1
- Changed github repository visibility to public

## 2021-09-17

### New Repository

Created empty repository
