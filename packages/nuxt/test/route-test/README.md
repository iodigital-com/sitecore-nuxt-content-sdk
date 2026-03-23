# Route integration tests

These tests spin up a real H3 server and send actual HTTP requests to validate
that the route handlers work correctly end-to-end, without Sitecore dependencies.

## Running

```bash
npx mocha --require ts-node/register test/route-test/**/*.integration.test.ts
```

## What is tested

- Real H3 server with `createApp` + `toNodeListener`
- Real HTTP requests via `fetch`
- Environment variables for secret and allowed origins
- No proxyquire, no stubs — only real route logic

## What is not tested

- Sitecore API calls (mocked via unit tests)
- NativeDataFetcher internals
