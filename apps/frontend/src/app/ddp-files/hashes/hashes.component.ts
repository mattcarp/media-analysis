import { Component, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';

import { HashesService } from '../store/services';
import { selectHashes, selectValidation } from '../store/selectors/ddp.selectors';
import { DdpState } from '../store/reducers/ddp.reducer';
import { FileItem, HashItem } from '../store/models';

@Component({
  selector: 'app-ddp-hashes',
  templateUrl: './hashes.component.html',
  styleUrls: ['./hashes.component.scss'],
})
export class HashesComponent implements OnInit, OnDestroy {
  computedHashes: any[];
  hashFiles$: Observable<HashItem[]>;
  isVerified = false;

  private destroy$: Subject<any> = new Subject<any>();
  private missingFiles: FileItem[] = [];

  constructor(
    private hashesService: HashesService,
    private store: Store<DdpState>,
  ) {}

  ngOnInit(): void {
    this.hashFiles$ = this.store.pipe(select(selectHashes));

    this.store.pipe(
      select(selectValidation),
      takeUntil(this.destroy$),
    ).subscribe(({ missingFiles }) => this.missingFiles = missingFiles);
  }

  verifyHashes(md5Arr: any): void {
    this.hashesService.computeHashes(md5Arr);
    this.isVerified = true;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isMissingFile(fileName: string): boolean {
    return !!this.missingFiles.find((file: FileItem) => file.name === fileName);
  }
}
