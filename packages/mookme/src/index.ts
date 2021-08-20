import { Command } from 'commander';

import draftlog from 'draftlog';
draftlog(console);

import { addAddPkg, addInit, addPublish, addRun, addAuthenticate, addInstall } from './commands';

const program = new Command();
program.version(process.env.MOOKME_CLI_VERSION || 'no-version');
addInit(program);
addRun(program);
addAddPkg(program);
addPublish(program);
addAuthenticate(program);
addInstall(program);

program.parse();
