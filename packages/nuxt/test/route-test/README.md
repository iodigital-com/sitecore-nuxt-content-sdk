# Route integration tests

These tests spin up a real H3 server and send actual HTTP requests to validate
that the route handlers work correctly end-to-end, without Sitecore dependencies.

Unlike unit tests, no stubs or proxyquire are used. The handlers run with their
real logic, against a real HTTP stack.

Both commands should be run at the nuxt package. (sitecore-nuxt-content-sdk\packages\nuxt)
## Running

`yarn route-test`


## Manual testing

Start a persistent server on port 3333:

`yarn route-test:server`

Then send requests via Postman or curl. Example:

GET http://localhost:3333/api/editing/config?secret=dev-secret
Header: origin: http://localhost:3333

## What is tested

- Real H3 server via createApp + toNodeListener
- Real HTTP requests via fetch
- Route handler logic including CORS, secret validation and response body
- Environment variables for secret and allowed origins

## What is not tested

- Sitecore API calls (covered by unit tests)
- NativeDataFetcher internals
- Routes that depend on an actual Nuxt runtime (e.g. createRobotsRoute)