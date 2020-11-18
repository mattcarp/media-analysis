import { Injectable, OnDestroy } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { NGXLogger } from 'ngx-logger';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DdpState } from '../reducers/ddp.reducer';
import { selectDdpFiles, selectHashes } from '../selectors/ddp.selectors';
import { DdpFile, FilesState, HashItem } from '../models';
import {
  setComputedHashItem,
  setHashesState,
  setHashItemProgress,
} from '../actions/ddp.actions';

declare const SparkMD5: any;

@Injectable({
  providedIn: 'root',
})
export class HashesService implements OnDestroy {
  hashes: any[] = [];
  allResumableFiles: any[];

  private destroy$ = new Subject<any>();

  constructor(private store: Store<DdpState>, private logger: NGXLogger) {
    this.store.pipe(
      select(selectDdpFiles),
      takeUntil(this.destroy$),
    ).subscribe((ddpFiles: FilesState) => {
      const allFiles: DdpFile[] = ddpFiles.files;
      this.getMd5Arr(allFiles);
    });

    this.store.pipe(select(selectHashes), takeUntil(this.destroy$))
      .subscribe((hashes: HashItem[]) => this.hashes = hashes);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  computeHashes(md5Arr): void {
    for (let i = 0; i < md5Arr.length; i++) {
      for (let j = 0; j < this.allResumableFiles.length; j++) {
        const hashFileName = this.hashes[i].targetFileName.toUpperCase();
        const resumableFileName = this.allResumableFiles[j].name.toUpperCase();
        if (hashFileName === resumableFileName) {
          const blobSlice = File.prototype.slice;
          const file = this.allResumableFiles[j];
          const CHUNK_SIZE = 2097152; // Read in chunks of 2MB
          const chunks = Math.ceil(file.size / CHUNK_SIZE);
          let currentChunk = 0;
          const spark = new SparkMD5.ArrayBuffer();
          const fileReader = new FileReader();

          fileReader.onload = (e: any) => {
            this.store.dispatch(
              setHashItemProgress({
                hash: md5Arr[i].hash,
                progress: Math.floor(((currentChunk + 1) / chunks) * 100),
              }),
            );
            spark.append(e.target.result); // append array buffer
            currentChunk++;

            if (currentChunk < chunks) {
              this.loadNext(
                fileReader,
                file,
                currentChunk,
                CHUNK_SIZE,
                blobSlice,
              );
            } else {
              if (i === md5Arr.length - 1) {
                this.logger.log('are we all done hashing? that would be great');
              }

              this.store.dispatch(
                setComputedHashItem({
                  hash: md5Arr[i].hash,
                  lastModified: file.lastModifiedDate,
                  computedHash: spark.end(),
                }),
              );
              console.info('computed hash:', spark.end()); // compute hash
            }
          };

          fileReader.onerror = () => {
            this.logger.error('something went wrong while hashing a file');
          };

          this.loadNext(fileReader, file, currentChunk, CHUNK_SIZE, blobSlice);
        }
      }
    }
  }

  loadNext = (fileReader, file, currentChunk, CHUNK_SIZE, blobSlice) => {
    const start = currentChunk * CHUNK_SIZE;
    const end =
      start + CHUNK_SIZE >= file.size ? file.size : start + CHUNK_SIZE;
    fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
  };

  // get an array of objects representing the md5 file's content and its name
  getMd5Arr(allResumableFiles: any[]): void {
    this.allResumableFiles = allResumableFiles;
    let hashItems: HashItem[] = [];

    for (const [index, value] of allResumableFiles.entries()) {
      const fileObj: any = value;
      const entry: HashItem = { targetFileName: '', hash: '' };
      const extension = fileObj.name.split('.').pop().toUpperCase();
      const baseFilename = fileObj.name.replace(/\.[^/.]+$/, '');
      const lastMod = fileObj.lastModifiedDate;
      if (extension === 'MD5') {
        if (fileObj.size > 100000) {
          this.logger.error('File size to large to be an MD5. Continuing');
          continue;
        }
        this.logger.log('we have an md5 file, must now read it');
        const reader = new FileReader();
        reader.onload = (event: any) => {
          // remove line breaks
          entry.hash = event.target.result.replace(/^\s+|\s+$/g, '');
          entry.lastModified = lastMod;
          entry.targetFileName = baseFilename;
          hashItems = [...hashItems, entry];
          const hashes = { hashes: hashItems };
          this.store.dispatch(setHashesState({ hashes }));
        };
        reader.readAsText(fileObj);
      } // if extension is md5
    }
  }
}
