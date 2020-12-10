import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { select, Store } from '@ngrx/store';


@Component({
  selector: 'app-file-actions',
  templateUrl: './file-actions.component.html',
  styleUrls: ['./file-actions.component.scss'],
})
export class FileActionsComponent implements OnInit, OnDestroy {
  private destroy$: Subject<any> = new Subject<any>();

  constructor(
    private store: Store<any>,
  ) {
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
