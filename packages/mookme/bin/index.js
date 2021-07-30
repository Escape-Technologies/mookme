#!/usr/bin/env node
process.env.MOOKME_CLI_VERSION = require('../package.json').version;
// Utilitary line for usage in dev environment
// console.log(`Running mookme from path : ${__filename}`);
require('../dist/index.js');
