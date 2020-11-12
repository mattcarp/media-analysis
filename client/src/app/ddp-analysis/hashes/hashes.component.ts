import { Component, OnInit } from '@angular/core';

import { HashesService } from '../store/services';

@Component({
  selector: 'ddp-hashes',
  templateUrl: './hashes.component.html',
  styleUrls: ['./hashes.component.scss'],
})
export class HashesComponent implements OnInit {
  computedHashes: any[];
  hashFiles: any[];
  hasHashes = false;

  constructor(private hashesService: HashesService) {}

  ngOnInit(): void {
    // TODO put these results in the store, get them back here
    this.hashesService.hashFilesParsed$.subscribe((hashFilesArr: any[]) => {
      this.hashFiles = hashFilesArr;
      this.hasHashes = true;
    });
  }

  verifyHashes(md5Arr): void {
    this.hashesService.computeHashes(md5Arr);
  }
}
