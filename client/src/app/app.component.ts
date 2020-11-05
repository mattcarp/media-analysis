import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { version } from '../../package.json';

import { ExtractMetadataService } from './extract-metadata/extract-metadata.service';
import { LoggerService } from './services/logger.service';
import { PrettierBytesService } from './services/prettier-bytes.service';
import { FileHandlerService } from './handle-files/handle-files.service';
import { FileTypeService } from './services/file-type.service';

export interface File {
  analysed: string;
  id: string;
  lastModified: number;
  lastModifiedDate: string;
  name: string;
  size: number;
  status: string;
  type: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  @ViewChild('consoleLog') consoleLog: ElementRef;
  title = 'client';
  metadataStarted: boolean;
  verUI = version;
  logger = '';
  files: File[] = [];
  audioValidations: any[] = [];
  videoValidations: any[] = [];

  constructor(
    private extractMetadataService: ExtractMetadataService,
    private loggerService: LoggerService,
    private cdr: ChangeDetectorRef,
    private prettierBytesService: PrettierBytesService,
    private fileHandlerService: FileHandlerService,
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
        document.location.hostname === 'localhost' || document.location.hostname === '127.0.0.1' ? 'localhost' : ''
      } %c client UI v.${this.verUI}`,
      style1,
      style2,
      '',
    );

    this.logger = `👉 Media Analysis, client UI v.${this.verUI} ─ is ready`;
  }

  handleFilesListChange(files: any): void {
    this.files.push(...files);

    this.files.forEach((file: File) => {
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
