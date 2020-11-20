import { Component, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { MsState } from '../store/models';
import { DdpState } from '../store/reducers/ddp.reducer';
import { selectMs } from '../store/selectors/ddp.selectors';

@Component({
  selector: 'app-ddp-ddpms',
  templateUrl: './ddpms.component.html',
  styleUrls: ['./ddpms.component.scss'],
})
export class DdpmsComponent implements OnInit, OnDestroy {
  parsedMs: MsState;
  hasMs = false;
  masterFormat: any = {};

  private destroy$: Subject<any> = new Subject<any>();

  constructor(private store: Store<DdpState>) {}

  ngOnInit(): void {
    this.store.pipe(
      select(selectMs),
      filter((ms: MsState) => !!ms),
      takeUntil(this.destroy$),
    ).subscribe((ms: MsState) => {
      this.hasMs = true;
      this.masterFormat.name = 'temp';
      this.parsedMs = ms;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
