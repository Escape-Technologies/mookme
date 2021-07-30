export interface LoaderManager {
  logger: (log: string) => void;
  updateMessage: (newMessage: string) => void;
  interval: ReturnType<typeof setInterval>;
}

export function loader(initialMessage = 'Running'): LoaderManager {
  let dotStatus = '.. ';
  let message = initialMessage;
  const logger = console.draft(message + dotStatus);
  const interval: ReturnType<typeof setInterval> = setInterval(() => {
    switch (dotStatus) {
      case '.. ':
        dotStatus = ' ..';
        break;
      case ' ..':
        dotStatus = '. .';
        break;
      case '. .':
        dotStatus = '.. ';
        break;
    }
    logger(message + dotStatus);
  }, 100);

  function updateMessage(newMessage: string): void {
    message = newMessage;
  }

  return { logger, interval, updateMessage };
}
