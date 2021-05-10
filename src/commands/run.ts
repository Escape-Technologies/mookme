import commander, { args } from "commander";
import fs from 'fs'
import {exec, execSync} from 'child_process' 
import draftlog from 'draftlog'
import chalk from 'chalk'
draftlog(console)

import {hookTypes, HookType, PackageHook} from '../types/hook.types'
import { hookPackage } from "../utils/hook-package";
import { getConfig } from "../utils/get-config";


interface Options {type: HookType, args: string}

export function addRun(program: commander.Command) {
    program.command('run')
        .requiredOption('-t, --type <type>', 'A valid git hook type ("pre-commit", "prepare-commit", "commit-msg", "post-commit")')
        .option('-a, --args <args>[]', 'The arguments being passed to the hooks', '')
        .action(async(opts: Options) => {


            process.env.MOOK_ME_ARGS = opts.args

            const {type} = opts
            if(!hookTypes.includes(type)) {
                console.log(`Invalid hook type ${type}`)
                process.exit(1)
            }

            const {packages, packagesPath} = getConfig()

            const hooks: PackageHook[] = []

            const stagedFiles = execSync('echo $(git diff --cached --name-only)').toString().split(' ')
            const packagesWithChanges = packages.filter(pkg => stagedFiles.find(file => file.includes(pkg)))
            
            packagesWithChanges
                .filter(name => fs.existsSync(`${packagesPath}/${name}/.hooks/${type}.json`))
                .map(name => ({name, path: `${packagesPath}/${name}/.hooks/${type}.json`, cwd: `${packagesPath}/${name}`}))
                .forEach(({name, path, cwd}) => {
                    const hook = JSON.parse(fs.readFileSync(path, 'utf-8'))
                    hooks.push({
                        name,
                        cwd,
                        type: hook.type,
                        venvActivate: hook.venvActivate,
                        steps: hook.steps
                    })
                })

            if(fs.existsSync(`${packagesPath}/.hooks/${type}.json`)) {
                hooks.push({
                    name: '__global',
                    cwd: '.',
                    steps: JSON.parse(fs.readFileSync(`${packagesPath}/.hooks/${type}.json`, 'utf-8')).steps
                })
            }

            const promisedHooks = []

            for(let hook of hooks.filter(hook => hook.steps.length > 0)) {
                promisedHooks.push(hookPackage(hook))
                // await new Promise((resolve) => setTimeout(() => resolve(null), 50))
            }

            try {
                const packagesErrors = await Promise.all(promisedHooks)
                packagesErrors.forEach(packageErrors => {
                    packageErrors.forEach(err => {
                        console.log(chalk.bgRed.white.bold(`Hook of package ${err.hook.name} failed at step ${err.step.name}`))
                        console.log(chalk.red(err.msg))
                    })
                    if(packageErrors.length > 0) {
                        process.exit(1)
                    }
                })
            } catch(err) {
                console.log(chalk.bgRed('Unexpected error !'))
                console.error(err)
            }
        });
}