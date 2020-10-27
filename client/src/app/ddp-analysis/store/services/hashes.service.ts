import { Injectable, OnDestroy } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DdpState } from '../reducers/ddp.reducer';
import { selectDdpFiles } from '../selectors/ddp.selectors';
import { DdpFile, FilesState, HashItem } from '../models';
import { setHashesState } from '../actions/ddp.actions';

declare const SparkMD5: any;

@Injectable()
export class HashesService implements OnDestroy {
  hashes$: any; // TODO use Observable<HashesState>
  hashes: any[] = [];
  allResumableFiles: any[];
  hashFilesParsed$ = this.hashFilesParsedSource.asObservable();
  allHashingComplete$ = this.allHashingComplete.asObservable();

  private hashFilesParsedSource = new Subject<any[]>();
  private allHashingComplete = new Subject<any[]>();
  private destroy$ = new Subject<any>();

  constructor(private store: Store<DdpState>) {
    this.store.pipe(
      select(selectDdpFiles),
      takeUntil(this.destroy$),
    ).subscribe((ddpFiles: FilesState) => {
      const allFiles: DdpFile[] = ddpFiles.files;
      this.getMd5Arr(allFiles);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  computeHashes(md5Arr) {
    for (const i = 0; i < md5Arr.length; i++) {
      for (const j = 0; j < this.allResumableFiles.length; j++) {
        if (this.hashes[i].baseFilename.toUpperCase() ===
          this.allResumableFiles[j].file.name.toUpperCase()) {

          const blobSlice = File.prototype.slice;
          const file = this.allResumableFiles[j].file;
          const CHUNK_SIZE = 2097152; // Read in chunks of 2MB
          const chunks = Math.ceil(file.size / CHUNK_SIZE);
          let currentChunk = 0;
          const spark = new SparkMD5.ArrayBuffer();
          const fileReader = new FileReader();

          fileReader.onload = (e: any) => {
            md5Arr[i].progress = Math.floor(((currentChunk + 1) / chunks) * 100);
            // console.log('prog:', md5Arr[i].progress);
            spark.append(e.target.result); // append array buffer
            currentChunk++;

            if (currentChunk < chunks) {
              this.loadNext(fileReader, file, currentChunk, CHUNK_SIZE, blobSlice);
            } else {
              if (i === md5Arr.length - 1) {
                console.log('are we all done hashing? that would be great');
              }

              md5Arr[i].fileLastMod = file.lastModifiedDate;
              md5Arr[i].computedHash = spark.end();
              console.info('computed hash:', spark.end());  // compute hash
            }
          };

          fileReader.onerror = () => {
            console.warn('something went wrong while hashing a file');
          };

          this.loadNext(fileReader, file, currentChunk, CHUNK_SIZE, blobSlice);
        }
      }
    }
  }

  loadNext = (fileReader, file, currentChunk, CHUNK_SIZE, blobSlice) => {
    const start = currentChunk * CHUNK_SIZE;
    const end = ((start + CHUNK_SIZE) >= file.size) ? file.size : start + CHUNK_SIZE;
    fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
  }

  // get an array of objects representing the md5 file's content and its name
  getMd5Arr(allResumableFiles: any[]) {
    this.allResumableFiles = allResumableFiles;
    const hashItems: HashItem[] = [];

    for (const i = 0; i < allResumableFiles.length; i++) {
      const fileObj: File = allResumableFiles[i].file;
      const entry: HashItem = { targetFileName: '', hash: ''};
      const extension = fileObj.name.split('.').pop().toUpperCase();
      const baseFilename = fileObj.name.replace(/\.[^/.]+$/, '');
      const lastMod = fileObj.lastModifiedDate;
      if (extension === 'MD5') {
        if (fileObj.size > 100000) {
          console.error('File size to large to be an MD5. Continuing');
          continue;
        }
        console.log('we have an md5 file, must now read it')
        const reader = new FileReader();
        reader.onload = (event: any) => {
          // remove line breaks
          entry.hash = event.target.result.replace(/^\s+|\s+$/g, '');
          entry.lastModified = lastMod;
          entry.targetFileName = baseFilename;
          console.log('the hash entry', entry);
          hashItems.push(entry);
        };
        reader.readAsText(fileObj);
      } // if extension is md5
      if (i === allResumableFiles.length - 1) {
        // TODO results is an empty array
        console.log('hash files have been gathered:', hashItems);
        this.store.dispatch(setHashesState({ hashes: hashItems }));
      }
    }
  }
}

