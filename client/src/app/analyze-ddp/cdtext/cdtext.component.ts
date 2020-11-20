import { Component, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CdTextService } from '../store/services';
import { DdpState } from '../store/reducers/ddp.reducer';
import {
  selectParsedCdText,
  selectParsedPackItems,
} from '../store/selectors/ddp.selectors';
import { ParsedCdTextItem, ParsedPackItem } from '../store/models';

@Component({
  selector: 'app-ddp-cdtext',
  templateUrl: './cdtext.component.html',
  styleUrls: ['./cdtext.component.scss'],
})
export class CdtextComponent implements OnInit, OnDestroy {
  parsedPackItems: ParsedPackItem[];
  parsedCdText: ParsedCdTextItem[];

  private destroy$: Subject<any> = new Subject<any>();

  constructor(
    private cdtextService: CdTextService,
    private store: Store<DdpState>,
  ) {}

  ngOnInit(): void {
    this.store.pipe(
      select(selectParsedCdText),
      takeUntil(this.destroy$)
    ).subscribe((parsedCdText: ParsedCdTextItem[]) => this.parsedCdText = parsedCdText);

    this.store.pipe(
      select(selectParsedPackItems), takeUntil(this.destroy$)
    ).subscribe((parsedPackItems: ParsedPackItem[]) => this.parsedPackItems = parsedPackItems);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
