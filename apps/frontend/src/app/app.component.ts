import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { select, Store } from '@ngrx/store';

import { FileEntry, ValidationState } from './media-files/store/models';
import { selectMediaFiles, selectValidations } from './media-files/store/selectors/media-files.selectors';
import { ModalService } from './shared/modal/modal.service';
import { version } from '../../../../package.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  verUI = version;
  verUploader = '0.0.16';
  files: FileEntry[] = [];
  filesCount = 0;
  isAddedFiles = false;
  isAnalysedFiles = false;

  private destroy$: Subject<any> = new Subject<any>();

  constructor(
    private modalService: ModalService,
    private store: Store<any>,
  ) {
    this.store.pipe(
      select(selectMediaFiles),
      takeUntil(this.destroy$),
    ).subscribe((files: FileEntry[]) => {
      this.files = files.slice();

      if (this.files.length > this.filesCount) {
        this.changeAnimation('input');
      }
      this.filesCount = this.files.length;
    });

    this.store.pipe(
      select(selectValidations),
      takeUntil(this.destroy$),
    ).subscribe((validations: ValidationState[]) => {
      if (validations.length) {
        setTimeout(() => {
          this.changeAnimation('output');
        }, 100);
      }
    });
  }

  ngOnInit(): void {
    this.consoleInfo();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  changeAnimation(direction: string): void {
    if (direction === 'input')  {
      this.isAddedFiles = true;
    }
    if (direction === 'output')  {
      this.isAnalysedFiles = true;
    }
    setTimeout(() => {
      this.isAddedFiles = false;
      this.isAnalysedFiles = false;
    }, 1500);
  }
}
