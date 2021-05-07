import commander from "commander";
import fs from 'fs'
import {exec, execSync} from 'child_process' 
import draftlog from 'draftlog'
import chalk from 'chalk'
draftlog(console)

import {hookTypes, HookType} from '../types/hook.types'
import {Config} from '../types/config.types'

interface Options {type: HookType, args: string}
interface StepCommand {name: string, command: string}
interface HookStep {name: string, steps: StepCommand[], cwd: string} 

export function addRun(program: commander.Command) {
    program.command('run')
        .requiredOption('-t, --type <type>', 'A valid git hook type ("pre-commit", "prepare-commit", "commit-msg", "post-commit")')
        .option('-a, --args <args>[]', 'The arguments being passed to the hooks', '')
        .action(async(opts: Options) => {

            const args = opts.args.split(' ').filter(arg => arg !== '')

            const {type} = opts
            if(!hookTypes.includes(type)) {
                console.log(`Invalid hook type ${type}`)
                process.exit(1)
            }

            let isRoot = false
            let rootDir  = process.cwd()
            while(!isRoot) {
                isRoot = fs.existsSync(`${rootDir}/.git`)
                if(!isRoot) {
                    rootDir = `${rootDir}/..`
                }
            }

            const packageJSON = JSON.parse(fs.readFileSync(`${rootDir}/package.json`, 'utf8'));
            const config = packageJSON.mookme as Config

            
            if(!config) {
                console.log('Please run `mookme --init` first')
                process.exit(1)
            }

            const {packages, packagesPath} = config

            const hooks: HookStep[] = []

            const stagedFiles = execSync('echo $(git diff --cached --name-only)').toString()
            const packagesWithChanges = Array.from(new Set(stagedFiles.split(' ').map(path => path.split('/')[0]))).filter(name => packages.includes(name))

            packages
                .filter(name => packagesWithChanges.includes(name))
                .filter(name => fs.existsSync(`${packagesPath}/${name}/.hooks/${type}.json`))
                .map(name => ({name, path: `${packagesPath}/${name}/.hooks/${type}.json`, cwd: `${packagesPath}/${name}`}))
                .forEach(({name, path, cwd}) => hooks.push({
                    name,
                    cwd,
                    steps: JSON.parse(fs.readFileSync(path, 'utf-8')).steps
                }))

            if(fs.existsSync(`${packagesPath}/.hooks/${type}.json`)) {
                hooks.push({
                    name: '__global',
                    cwd: '.',
                    steps: JSON.parse(fs.readFileSync(`${packagesPath}/.hooks/${type}.json`, 'utf-8')).steps
                })
            }

            const loggers: {[key: string]: any} = {}

            hooks.filter(hook => hook.steps.length > 0).forEach(hook => {
                loggers[hook.name] = console.draft(`${chalk.bold.inverse(` Hooks : ${hook.name} `)}${chalk.bgBlueBright.bold(' Running... ')}`)
                const errors = []

                Promise.all(hook.steps.map(step => new Promise((resolve, reject) => {
                    const hookLoggers: {[key: string]: any} = {}
                    const title: Function[] = []
                    let currentStatus: string = 'Running.. '
                    title.push(console.draft(`→ ${chalk.bold(step.name)} > ${step.command} `))
                    title.push(console.draft('Running .'))
                    const titleTO = setInterval(() => {
                        switch(currentStatus) {
                            case 'Running.. ':
                                currentStatus = 'Running ..'
                                break
                            case 'Running ..':
                                currentStatus = 'Running. .'
                                break
                            case 'Running. .':
                                currentStatus = 'Running.. '
                                break
                        }
                        title[1](currentStatus)
                    } , 100)

                    const cp = exec(step.command.replace('{args}', `"${args.join(' ')}"`),  {cwd: hook.cwd})
                    hookLoggers[step.name] = console.draft()
                    
                    cp.stderr?.on('data', (err) => {
                        reject(err)
                        errors.push({name: hook.name, step: step.name, err});
                    });
                
                    cp.on('exit', (code) => {
                        clearInterval(titleTO)
                        if(code === 0) {
                            title[1]('✅ Done.') 
                        } else {
                            title[1]('❌ Error.') 
                        }
                        resolve('ok')
                    });

                })))
                    .then(() => loggers[hook.name](`${chalk.bold.inverse(` Hooks : ${hook.name} `)}${chalk.bgGreen.bold(' Done ✓ ')}`))
                    .catch((err) => loggers[hook.name](`${chalk.bold.inverse(` Hooks : ${hook.name} `)}${chalk.bgRed.bold(' Error × ')}`))
            })
        });
}