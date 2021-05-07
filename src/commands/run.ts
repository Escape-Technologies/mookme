import commander from "commander";
import fs from 'fs'

enum HookType {
    preCommit = "pre-commit",
    prepareCommit = "prepare-commit",
    commitMsg = "commit-msg",
    postCommit = "post-commit",
}

const hookTypes = Object.values(HookType)

interface Options {type: HookType}

export function addRun(program: commander.Command) {
    program.command('run')
        .requiredOption('-t, --type <type>', 'A valid git hook type ("pre-commit", "prepare-commit", "commit-msg", "post-commit")')
        .action(async(opts: Options) => {
            const {type} = opts
            if(!hookTypes.includes(type)) {
                console.log(`Invalid hook type ${type}`)
                process.exit(1)
            }

            const packageJSON = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            const config = packageJSON.mookMe
            if(!config) {
                console.log('Please run `mookme --init` first')
                process.exit(1)
            }
        });
}