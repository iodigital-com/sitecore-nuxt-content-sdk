module.exports = {
  require: ['ts-node/register'],
  spec: 'test/route-test/**/*.integration.test.ts',
  timeout: 10000,
  exit: true,
};
