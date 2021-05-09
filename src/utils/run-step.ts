import draftlog from 'draftlog'
import chalk from 'chalk'
draftlog(console)

import { StepCommand } from "../types/step.types"
import { exec, execSync } from 'child_process'
import { loader } from './loader'

export interface RunStepOptions {
    name: string,
    cwd: string,
    type?: string,
    venvActivate?: string
}

export function runStep(step: StepCommand, options: RunStepOptions): Promise<{step: StepCommand, msg: Error} | null> {
    const args = process.env.MOOK_ME_ARGS!.split(' ').filter(arg => arg !== '')

    if(options.type === 'python' && options.venvActivate) {
        step.command = `source ${options.venvActivate} && ` + step.command
    }

    return new Promise((resolve, reject) => {
        const hookLoggers: {[key: string]: any} = {}
        console.log(`→ ${chalk.bold(step.name)} > ${step.command} `)
        const {logger, interval} = loader()

        const cp = exec(step.command.replace('{args}', `"${args.join(' ')}"`),  {cwd: options.cwd})
        hookLoggers[step.name] = console.draft()

        let out = ''
        cp.stdout?.on('data', (chunk) => {
            out += `\n${chunk}`
        });
        
        let error = ''
        cp.stderr?.on('data', (chunk) => {
            error += `\n${chunk}`
        });
    
        cp.on('exit', (code) => {
            clearInterval(interval)
            if(code === 0) {
                logger('✅ Done.') 
                resolve(null)
            } else {
                console.log(error)
                resolve({
                    step: step,
                    msg: new Error(error + chalk.bold('\nstdout :\n') + out)
                })
                logger('❌ Error.') 
            }
        });

    })
}