export function loader(initial: string =  'Running.. ') {
    let currentStatus = initial
    const logger = console.draft(currentStatus)
    const titleTO: ReturnType<typeof setInterval> = setInterval(() => {
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
       logger(currentStatus)
    }, 100)
    return {logger, titleTO}
}