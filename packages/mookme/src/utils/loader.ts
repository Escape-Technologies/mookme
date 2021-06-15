export function loader(initial = 'Running.. '): {
  logger: (log: string) => void;
  interval: ReturnType<typeof setInterval>;
} {
  let currentStatus = initial;
  const logger = console.draft(currentStatus);
  const interval: ReturnType<typeof setInterval> = setInterval(() => {
    switch (currentStatus) {
      case 'Running.. ':
        currentStatus = 'Running ..';
        break;
      case 'Running ..':
        currentStatus = 'Running. .';
        break;
      case 'Running. .':
        currentStatus = 'Running.. ';
        break;
    }
    logger(currentStatus);
  }, 100);
  return { logger, interval };
}
