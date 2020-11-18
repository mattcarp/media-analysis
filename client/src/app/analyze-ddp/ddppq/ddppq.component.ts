import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { PqState } from '../store/models';
import { DdpState } from '../store/reducers/ddp.reducer';
import { selectPq } from '../store/selectors/ddp.selectors';

@Component({
  selector: 'ddp-ddppq',
  templateUrl: './ddppq.component.html',
  styleUrls: ['./ddppq.component.scss'],
})
export class DdppqComponent implements OnInit {
  hasPq = false;
  parsedPq: PqState;

  private destroy$: Subject<any> = new Subject<any>();

  constructor(private store: Store<DdpState>) {}

  ngOnInit(): void {
    this.store.pipe(
      select(selectPq),
      filter((pq: PqState) => !!pq),
      takeUntil(this.destroy$),
    ).subscribe((pq: PqState) => {
      this.hasPq = true;
      this.parsedPq = pq;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
