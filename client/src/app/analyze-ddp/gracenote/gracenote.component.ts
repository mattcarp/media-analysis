import { Component, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DdpState } from '../store/reducers/ddp.reducer';
import { selectGracenote } from '../store/selectors/ddp.selectors';
import { Gracenote } from '../store/models';

@Component({
  selector: 'ddp-gracenote',
  templateUrl: 'gracenote.component.html',
  styleUrls: ['gracenote.component.scss'],
})
export class GracenoteComponent implements OnInit, OnDestroy {
  gracenoteData: Gracenote;

  private destroy$: Subject<any> = new Subject<any>();

  constructor(private store: Store<DdpState>) {}

  ngOnInit(): void {
    this.store
      .pipe(select(selectGracenote), takeUntil(this.destroy$))
      .subscribe(
        (gracenoteData: Gracenote) => this.gracenoteData = gracenoteData,
      );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
