import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { version } from '../../package.json';
import { ExtractMetadataService } from './extract-metadata/extract-metadata.service';
import { LoggerService } from './services/logger.service';
import { PrettierBytesService } from './services/prettier-bytes.service';
import { FileHandlerService } from './handle-files/handle-files.service';
import { FileTypeService } from './services/file-type.service';
import { DetectBlackService } from './detect-black/detect-black.service';
import { AnalyzeAudioService } from './analyze-audio/analyze-audio.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  @ViewChild('consoleLog') consoleLog: ElementRef;
  title = 'client';
  metadataResult: any;
  verUI = version;
  logger = '';
  isTooLowHeight = false;

  files: File[] = [];

  constructor(
    private extractMetadataService: ExtractMetadataService,
    private loggerService: LoggerService,
    private cdr: ChangeDetectorRef,
    private prettierBytesService: PrettierBytesService,
    private fileHandlerService: FileHandlerService,
    private fileTypeService: FileTypeService,
    private eltRef: ElementRef,
    private detectBlackService: DetectBlackService,
    private detectMonoService: AnalyzeAudioService,
  ) {
    extractMetadataService.metadataResult.subscribe((a) => {
      this.loggerService.info(`metadataResult.subscribe:`, 'color: darkgrey');
      this.loggerService.debug(`\t error: ${a.error}`, 'color: red');
      this.loggerService.debug(`\t analysis: ${a.analysis}`, 'color: grey');

      this.metadataResult = a;
    });

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

    window.addEventListener('resize', this.resize, true);
    setTimeout(() => this.resize());
  }

  handleFilesListChange(files: any): void {
    this.files = files;

    this.files.forEach((file: File) => {
      this.fileHandlerService.setMediaFile(file);

      this.extractMetadataService.extract(file);
      this.extractMetadataService.metadataResult.subscribe(() => {
        // const analysisObj = JSON.parse(metadata.analysis);
        // TODO only if video, detect black and detect mono
        this.detectBlackService.recursiveBlackDetect(file, 'head');
        this.detectBlackService.recursiveBlackDetect(file, 'tail');

        // attempt to clear previous state - TODO not working
        // detectMonoService.results = [];
        // detectMonoService.signalAnalysis = [];
        // TODO pass bitrate from analysisObj to detectMono as second param
        this.detectMonoService.detectMono(file);
      });
    });
  }

  prettierBytes(size: number): string {
    return this.prettierBytesService.prettierBytes(size);
  }

  setTypeClass(type: string): string {
    return type.replace(/\//g, '-');
  }

  getFileType(file: File): string {
    return this.fileTypeService.getFileType(file);
  }

  resize = (): void => {
    this.isTooLowHeight = window.innerHeight < 530;
  };
}
