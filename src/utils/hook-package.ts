import draftlog from 'draftlog'
import chalk from 'chalk'
draftlog(console)
import { PackageHook } from '../types/hook.types'
import { runStep } from './run-step'
import { StepCommand } from '../types/step.types'

export function hookPackage(hook: PackageHook): Promise<{hook: PackageHook, step: StepCommand, msg: Error}[]> {

    const loggers: {[key: string]: any} = {}
    loggers[hook.name] = console.draft(`${chalk.bold.inverse(` Hooks : ${hook.name} `)}${chalk.bgBlueBright.bold(' Running... ')}`)

    return new Promise((resolve, reject) => Promise.all(hook.steps.map(step => runStep(step, {name: hook.name, cwd: hook.cwd})))
        .then((errors) => {
            const hasError = errors.find(err => err !== null)
            const result = hasError ? chalk.bgRed.bold(' Error × ') : chalk.bgGreen.bold(' Done ✓ ')
            loggers[hook.name](`${chalk.bold.inverse(` Hooks : ${hook.name} `)}${result}`)
            resolve(errors.filter(err => err !== null).map(err => ({
                hook: hook,
                step: err!.step,
                msg: err!.msg
            })))
        })
        .catch((err) => {
            loggers[hook.name](`${chalk.bold.inverse(` Hooks : ${hook.name} `)}${chalk.bgRed.bold(' Error × ')}`)
            reject(err)
        }))
}