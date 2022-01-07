import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { interval } from 'rxjs';
import { Contraction } from './contraction';
import { formatDuration } from './util';

const storeKeyName = 'contractions';

class DataStore {
  contractions: Contraction[] = [];
  inProgress: Contraction | null = null;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  private timer = interval(1000);
  records: Contraction[] = [];
  inProgress: Contraction = new Contraction();

  inProgressDelta: string = '';

  exportData: string = '';
  importShow: boolean = false;
  importControl = new FormControl();

  constructor() {
    try {
      const dataStore = localStorage.getItem(storeKeyName);
      if( dataStore !== null ) {
        const ds = <DataStore>JSON.parse(dataStore);
        this.records = (ds.contractions || []).map( c => new Contraction(c));
        this.inProgress = new Contraction(ds.inProgress || undefined);
      }
    } catch(e) {
      window.alert(e);
    }
  }

  ngOnInit(): void {
    this.timer.subscribe({
      next: () => this.tick()
    });
    this.tick();
  }

  tick() {
    const ctn = this.inProgress;
    if( ctn?.start == null ) {
      this.inProgressDelta = 'Ready';
      if( this.records.length > 0 && this.records[0] != null ) {
        const start = this.records[0]?.start || 0;
        if( start <= 0) return;
        this.inProgressDelta = `Apart ${formatDuration(Date.now() - start)}`;
      }
    } else {
      const delta = Date.now() - ctn.start;
      this.inProgressDelta = `Long ${formatDuration(delta)}`;
    }
  }

  start() {
    if( this.inProgress?.start == null ) {
      this.inProgress = new Contraction();
      this.inProgress.start = new Date().getTime();
      if( this.records.length > 0 && this.records[0] != null ) {
        this.inProgress.gapToPrevious = this.inProgress.start - (this.records[0]?.start || 0);
      }
      this.save();
    }
  }

  end(): void {
    if( this.inProgress?.start == null ) return;
    if( this.inProgress.end == null ) {
      this.inProgress.end = new Date().getTime();
      this.records.splice(0, 0, this.inProgress);
      this.inProgress = new Contraction();
      this.save();
    }
  }

  private archiveState(): string {
    const ds = new DataStore();
    ds.contractions = this.records;
    ds.inProgress = this.inProgress;
    return JSON.stringify(ds);
  }
  private save(): void {
    try {
      localStorage.setItem(storeKeyName, this.archiveState());
    } catch {
    }
  }

  reset(): void {
    if( window.confirm("Are you you want to reset and erase all data?") ) {
      this.records = [];
      this.inProgress = new Contraction();
      this.save();
    }
  }
  export(): void {
    this.exportData = this.archiveState();
  }
  exportDone(): void {
    this.exportData = '';
  }
  importToggle(): void {
    if( this.importShow ) { // now become hidden
      this.importControl.reset();
      this.importShow = false;
    } else {
      this.importShow = true;
    }
  }
  import(): void {
    if( this.importControl.valid && window.confirm("Importing will erase all current data, are you due you want to continue?") ) {
      try {
        const maybeDS = JSON.parse(this.importControl.value);
        const ctns = maybeDS.contractions
          .map((c: Object) => new Contraction(c))
          .filter((ctn: Contraction) => ctn.start && ctn.end);
        const inp = new Contraction(maybeDS.inProgress);
        if( ctns.length && !inp.end ) {
          this.records = ctns;
          this.inProgress = inp;
          this.save();
        } else {
          throw new Error('Unable to under data structure');
        }
      } catch(e) {
        window.alert(e);
      }
    }
  }
}
