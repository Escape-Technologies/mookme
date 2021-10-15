#!/usr/bin/env node
process.env.MOOKME_CLI_VERSION = require('/usr/local/lib/node_modules/@escape.tech/mookme/package.json').version;
if (process.argv.find((arg) => arg === '-V')) {
  console.log(process.env.MOOKME_CLI_VERSION);
  process.exit(0);
}

// Utilitary line for usage in dev environment
// console.log(`Running mookme from path : ${__filename}`);
require('../dist/index.js');
