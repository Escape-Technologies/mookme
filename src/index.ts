import {Command, commands} from 'commander'

import {addInit} from './commands'

const program = new Command();
program.version(process.env.MOOKME_CLI_VERSION || 'no-version');
addInit(program)

program.parse()
