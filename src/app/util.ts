export function formatDuration(millis: number): string {
    const minutes = Math.trunc(millis/60000);
    const seconds = Math.trunc((millis - minutes*60000)/1000);
    return `${minutes<10 ? '0':''}${minutes}:${seconds<10 ? '0':''}${seconds}`;
  }
  