#!/usr/bin/env node
process.env.MOOKME_CLI_VERSION = require('../package.json').version
require('../dist/index.js')