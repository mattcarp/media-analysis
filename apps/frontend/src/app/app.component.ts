import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';

import { version } from '../../../../package.json';
import { selectMediaFiles } from './media-files/store/selectors/media-files.selectors';
import { ModalService } from './shared/modal/modal.service';
import { MediaFilesService } from './media-files/store/services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  verUI = version;
  uploaderVer = '0.0.15';
  files: any[] = [];

  private destroy$: Subject<any> = new Subject<any>();

  constructor(
    private modalService: ModalService,
    private mediaFilesService: MediaFilesService,
    private store: Store<any>,
  ) {
    this.store.pipe(
      select(selectMediaFiles),
      takeUntil(this.destroy$),
    ).subscribe((files: any[]) => this.files = files);
  }

  ngOnInit(): void {
    this.consoleInfo();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleAddedFiles(files: any[]): void {
    const newFiles: File[] = [];

    files.forEach((file: File) => {
      newFiles.push(file);
    });

    this.files = this.files.concat(newFiles);
    this.mediaFilesService.handleFiles(this.files);
  }

  handleRemovedFiles(fileId: string): void {
    let removedFile;
    this.files = this.files.filter((file) => {
      if (file.id === fileId) {
        removedFile = file;
      }

      return file.id !== fileId;
    });

    if (fileId === 'all') {
      this.files = [];
    }

    this.mediaFilesService.handleFiles(this.files);
  }

  handleUploadedFilesChanged(event): void {}

  handleUploaderVer(event): void {
    this.uploaderVer = event;
  }

  isDDP(files: any[]): boolean {
    let isDDPPQ = false;
    let isDDPMS = false;
    let isDDPID = false;

    files.forEach((file: File) => {
      if (file.name === 'DDPPQ') {
        isDDPPQ = true;
      }
      if (file.name === 'DDPMS') {
        isDDPMS = true;
      }
      if (file.name === 'DDPID') {
        isDDPID = true;
      }
    });

    return isDDPPQ && isDDPMS && isDDPID;
  }

  onAboutClick(): void {
    this.modalService.openModal('aboutModal');
  }

  consoleInfo(): void {
    const style1 = [
      'padding: 0.4rem 0.8rem;',
      'background: linear-gradient(#4560ad, #1139ad);',
      'font: 0.8rem/1 -apple-system, Roboto, Helvetica, Arial;',
      'color: #fff;',
    ].join('');
    const style2 = ['color: red;'].join('');

    console.log(
      `%c ► Media Analysis %c ${
        document.location.hostname === 'localhost' ||
        document.location.hostname === '127.0.0.1'
          ? 'localhost'
          : ''
      } %c client UI v.${this.verUI}`,
      style1,
      style2,
      '',
    );
  }
}
