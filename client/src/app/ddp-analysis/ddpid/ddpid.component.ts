import { Component, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { IdState } from '../store/models';
import { DdpState } from '../store/reducers/ddp.reducer';
import { selectId } from '../store/selectors/ddp.selectors';

@Component({
  selector: 'ddp-ddpid',
  templateUrl: './ddpid.component.html',
  styleUrls: ['./ddpid.component.scss'],
})
export class DdpIdComponent implements OnInit, OnDestroy {
  hasId = false;
  parsedId: IdState;

  private destroy$: Subject<any> = new Subject<any>();

  constructor(private store: Store<DdpState>) {}

  ngOnInit(): void {
    this.store.pipe(
      select(selectId),
      filter((id: IdState) => !!id),
      takeUntil(this.destroy$),
    ).subscribe((id: IdState) => {
      this.hasId = true;
      this.parsedId = id;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
