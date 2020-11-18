import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { version } from '../../package.json';

import { File } from './models/file.model';
import { ExtractMetadataService } from './extract-metadata/extract-metadata.service';
import { LoggerService } from './services/logger.service';
import { PrettierBytesService } from './services/prettier-bytes.service';
import { UploaderService } from './uploader/uploader.service';
import { FileTypeService } from './services/file-type.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'client';
  metadataStarted: boolean;
  verUI = version;
  logger = '';
  files: File[] = [];
  audioValidations: any[] = [];
  videoValidations: any[] = [];
  isDDP = false;
  isDDPPQ = false;
  isDDPMS = false;
  isDDPID = false;

  constructor(
    private extractMetadataService: ExtractMetadataService,
    private loggerService: LoggerService,
    private cdr: ChangeDetectorRef,
    private prettierBytesService: PrettierBytesService,
    private fileHandlerService: UploaderService,
    private fileTypeService: FileTypeService,
  ) {
    loggerService.loggerResult.subscribe((res) => {
      this.logger += `\n${res}`;
      this.cdr.detectChanges();
    });
  }

  ngOnInit(): void {
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

    this.logger = `👉 Media Analysis, client UI v.${this.verUI} ─ is ready`;
  }

  handleFilesListChange(files: File[]): void {
    this.files.push(...files);

    this.files.forEach((file: File) => {
      if (file.name === 'DDPPQ') {
        this.isDDPPQ = true;
      }
      if (file.name === 'DDPMS') {
        this.isDDPMS = true;
      }
      if (file.name === 'DDPID') {
        this.isDDPID = true;
      }
      this.isDDP = this.isDDPPQ && this.isDDPMS && this.isDDPID;

      this.fileHandlerService.setMediaFile(file);
      this.extractMetadataService.extract(file);
    });
  }

  prettierBytes(size: number): string {
    return this.prettierBytesService.prettierBytes(size);
  }

  setTypeClass(type: string): string {
    return type.split('/')[0];
  }

  getFileType(file: any): string {
    return this.fileTypeService.getFileType(file);
  }

  handleResult(res: string, fileID: string): void {
    this.files.find((file) => file.id === fileID).analysed = res;
  }
}
