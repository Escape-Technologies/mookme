import { Command } from 'commander';

import { addAddPkg, addInit, addPublish, addRun } from './commands';

const program = new Command();
program.version(process.env.MOOKME_CLI_VERSION || 'no-version');
addInit(program);
addRun(program);
addAddPkg(program);
addPublish(program);

program.parse();
