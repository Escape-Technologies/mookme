export interface SpinnerManager {
  display: (log: string) => void;
  updateMessage: (newMessage: string) => void;
  interval: ReturnType<typeof setInterval>;
}

export function spin(initialMessage = 'Running'): SpinnerManager {
  let dotStatus = '.. ';
  let message = initialMessage;
  const display = console.draft(message + dotStatus);
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
    display(message + dotStatus);
  }, 100);

  function updateMessage(newMessage: string): void {
    message = newMessage;
  }

  return { display, interval, updateMessage };
}
