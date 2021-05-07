import draftlog from 'draftlog'
import chalk from 'chalk'
draftlog(console)

import { StepCommand } from "../types/step.types"
import { exec } from 'child_process'

export interface RunStepOptions {
    name: string,
    cwd: string
}

export function runStep(step: StepCommand, options: RunStepOptions): Promise<{step: StepCommand, msg: Error} | null> {
    const args = process.env.MOOK_ME_ARGS!.split(' ').filter(arg => arg !== '')

    return new Promise((resolve, reject) => {
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

        const cp = exec(step.command.replace('{args}', `"${args.join(' ')}"`),  {cwd: options.cwd})
        hookLoggers[step.name] = console.draft()
        
        let error = ''
        cp.stderr?.on('data', (chunk) => {
            error += `\n${chunk}`
        });
    
        cp.on('exit', (code) => {
            clearInterval(titleTO)
            if(code === 0) {
                title[1]('✅ Done.') 
                resolve(null)
            } else {
                resolve({
                    step: step,
                    msg: new Error(error)
                })
                title[1]('❌ Error.') 
            }
        });

    })
}