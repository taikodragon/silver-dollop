import { formatDuration } from "./util";

export class Contraction {
    constructor(other?: any) {
      if( other ) {
        this.start = other.start;
        this.end = other.end;
        this.gapToPrevious = other.gapToPrevious;
      }
    }
  
    start: number | null = null;
    end: number | null = null;
    gapToPrevious: number | null = null;
  
    get atTime(): string {
      if( this.start == null ) return '';
      const at = new Date(this.start);
      const year = at.getFullYear();
      const month = at.getMonth() + 1;
      const day = at.getDate() + 1;
      const hour = at.getHours();
      const minute = at.getMinutes();
      return `${year}-${month<10?'0':''}${month}-${day<10?'0':''}${day} ${hour<10?'0':''}${hour}:${minute<10?'0':''}${minute}`;
    }
    get duration(): string {
      if( this.start == null || this.end == null ) return '00:00';
      const fiveSeconds = 5000;
      const delta = Math.trunc((this.end - this.start + 999) / fiveSeconds) * fiveSeconds;
      return formatDuration(delta);
    }
    get apartDuration(): string {
      if( this.gapToPrevious == null ) return '';
      const fifteenSeconds = 15000;
      const delta = Math.trunc((this.gapToPrevious + 999) / fifteenSeconds) * fifteenSeconds;
      return formatDuration(delta);
    }
  }
