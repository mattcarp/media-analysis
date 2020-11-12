import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { HashesService } from '../store/services';
import { selectHashes } from '../store/selectors/ddp.selectors';
import { DdpState } from '../store/reducers/ddp.reducer';
import { HashItem } from '../store/models';

@Component({
  selector: 'ddp-hashes',
  templateUrl: './hashes.component.html',
  styleUrls: ['./hashes.component.scss'],
})
export class HashesComponent implements OnInit {
  computedHashes: any[];
  hashFiles$: Observable<HashItem[]>;

  constructor(private hashesService: HashesService, private store: Store<DdpState>) {}

  ngOnInit(): void {
    this.hashFiles$ = this.store.pipe(select(selectHashes));
  }

  verifyHashes(md5Arr): void {
    this.hashesService.computeHashes(md5Arr);
  }
}
