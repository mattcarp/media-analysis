import { Component } from '@angular/core';

import { ExtractMetadataService } from './extract-metadata.service';
import { LoggerService } from '../services/logger.service';

declare let $: any;

@Component({
  selector: 'extract-metadata',
  templateUrl: './extract-metadata.component.html',
})
export class ExtractMetadataComponent {
  metadataStarted: any; // the event emitter
  metadataResult: any;
  metadataLoading: boolean;
  metadata: boolean;
  ffprobeErr: string;
  format = [];
  formatTags = [];
  showFormat = false;
  streams: any[]; // an array of arrays of stream objects
  showMetadata = false;

  constructor(extractMetadataService: ExtractMetadataService, private loggerService: LoggerService) {
    // clear state - TODO use a redux store for this
    this.metadataResult = null;

    this.metadataLoading = false;
    this.metadataStarted = extractMetadataService.metadataStarted;
    this.metadataStarted.subscribe((value) => {
      if (value === true) {
        this.loggerService.info(`Metadata extraction started`, 'color: darkgrey');
      }
      this.metadataLoading = value;
    });
    this.metadataResult = extractMetadataService.metadataResult;
    this.metadataResult.subscribe((value) => {
      this.renderResult(value);
    });
  }

  renderResult(data) {
    if (data.error) {
      if (!data.error.includes('Error splitting the input into NAL units')) {
        this.ffprobeErr = data.error;
      }
    }
    const analysisObj = JSON.parse(data.analysis);
    this.loggerService.info(`Analysis object, and number of keys:`, 'color: grey');
    console.log(analysisObj);
    console.log(Object.keys(analysisObj).length);

    if (analysisObj && Object.keys(analysisObj).length !== 0) {
      const formatObj = analysisObj.format;
      // zone.run(() => { this.showFormat = true});
      this.showFormat = true;
      this.format = this.processObject(formatObj);
      this.loggerService.info(
        `Format object, from which we can filter extraneous keys: ${this.format}`,
        'color: green',
      );

      if (formatObj.tags && Object.keys(formatObj.tags).length !== 0) {
        this.formatTags = this.processObject(formatObj.tags);
      }
    }

    if (analysisObj.streams && Object.keys(analysisObj.streams).length !== 0) {
      const collectedStreams = [];
      const inputStreams = analysisObj.streams;

      inputStreams.forEach((currentStream) => {
        this.loggerService.info(`I'm a stream`, 'color: green');
        collectedStreams.push(this.processObject(currentStream));
      });

      this.streams = collectedStreams;
      // show the panel
      this.metadata = true;
    }
  }

  // takes an object, removes any keys with array values, and returns
  // an array of objects: {key: value}
  // this is handy for ffprobe's format and tags objects
  processObject(formatObj): Object[] {
    if (Array.isArray(formatObj)) {
      const newObj: any = {};
      formatObj.map(item => Object.keys(item).map((key: string) => {
          newObj[key] = item[key];
        }),
      );
      formatObj = newObj;
    }
    let keysArr: string[] = Object.keys(formatObj);
    return keysArr
        // TODO filter if value for key is object or array, rather than not 'tags'
        .filter((formatKey) => formatKey !== 'tags')
        .map((formatKey) => {
          const item: any = {};
          // replace underscores and format with initial caps
          item.key = formatKey
            .replace(/_/g, ' ')
            .replace(/(?:^|\s)[a-z]/g, function (m) {
              return m.toUpperCase();
            })
            .replace('Nb ', 'Number of ');
          item.value = formatObj[formatKey];
          return item;
        })
  }

  toggleMetadata() {
    this.showMetadata = !this.showMetadata;
  }

  isItemWithLinearValue(value: any): boolean {
    return typeof value === 'string' || typeof value === 'number';
  }
} // class
