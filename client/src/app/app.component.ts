import {Component, OnInit} from '@angular/core';

import {ExtractMetadataService} from './extract-metadata/extract-metadata.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'client';
  metadataResult: any;
  verUI: string;

  constructor(private extractMetadataService: ExtractMetadataService) {
    this.verUI = require('../../package.json').version;
    extractMetadataService.metadataResult
      .subscribe((a) => {
        console.log('!2', a);
        this.metadataResult = a;
      });
  }

  ngOnInit(): void {
    const style1 = [
      'padding: 0.4rem 0.8rem;',
      'background: linear-gradient(#4560ad, #1139ad);',
      'font: 0.8rem/1 -apple-system, Roboto, Helvetica, Arial;',
      'color: #fff;'
    ].join('');
    const style2 = [
      'color: red;'
    ].join('');

    console.log(
      `%c ► Media Analysis %c ${
        location.hostname === 'localhost' || location.hostname === '127.0.0.1'
          ? 'localhost'
          : ''
      } %c client UI v.${this.verUI}`, style1, style2, ''
    );
  }
}
