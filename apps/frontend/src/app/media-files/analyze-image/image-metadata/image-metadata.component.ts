import { Component, Input, OnInit } from '@angular/core';

import { FileEntry } from '../../store/models';
import { HelperService } from '../../store/services';
import { ValidationsImageService } from '../../store/services';

declare let $: any;
const SLICE_SIZE = 150000;

@Component({
  selector: 'app-image-metadata',
  templateUrl: './image-metadata.component.html',
})
export class ImageMetadataComponent implements OnInit {
  @Input() file: FileEntry;
  ffprobeErr: string;
  isMetadata: boolean;
  format = [];
  formatTags = [];
  streams: any[]; // an array of arrays of stream objects
  endpoint: string;
  blob: Blob;

  constructor(
    private helperService: HelperService,
    private imageValidationsService: ValidationsImageService,
  ) {
    this.endpoint = this.helperService.getEndpoint();
    console.log(`%c Metadata extraction started`, 'color: darkgrey');
  }

  ngOnInit(): void {
    this.extract(this.file);
  }

  extract(file: any): void {
    const reader = new FileReader();

    // if we use onloadend, we need to check the readyState.
    reader.onloadend = (evt: ProgressEvent<FileReader>) => {
      if (evt.target.readyState === FileReader.DONE) {
        // angular Http doesn't yet support raw binary POSTs - aha! hey @sergei - this is why i used $.ajax!
        // https://github.com/angular/angular/blob/2.0.0-beta.1/modules/angular2/src/http/static_request.ts
        $.ajax({
          type: 'POST',
          url: this.endpoint + 'analysis',
          // TODOmc isn't this.blob just an empty slice?
          data: this.blob,
          // don't massage binary to JSON
          processData: false,
          // content type that we are sending
          contentType: 'application/octet-stream',
          error: (err) => {
            console.log(`%c You have an error on the ajax request:`, 'color: red');
            console.log(err);
          },
          success: (data) => {
            // error handling
            console.log(`%c This is what I got from ffprobe metadata:`, 'color: darkgrey');

            this.renderResult(data);
            this.imageValidationsService.validate(file.id, data);
          },
        });
      }
    };

    this.blob = file.slice(0, SLICE_SIZE);
    reader.readAsArrayBuffer(this.blob);
  }

  renderResult(data: { analysis; error }) {
    if (data.error) {
      if (!data.error.includes('Error splitting the input into NAL units')) {
        this.ffprobeErr = data.error;
      }

      this.helperService.informer(data.error);
    }


    if (data.analysis) {
      const analysisObj = JSON.parse(data.analysis);
      console.log(`%c Analysis object, and number of keys:`, 'color: grey');
      console.log(analysisObj);
      console.log(Object.keys(analysisObj).length);

      if (analysisObj && Object.keys(analysisObj).length !== 0) {
        const formatObj = analysisObj.format;
        this.format = this.processObject(formatObj);
        console.log(`%c Format object, from which we can filter extraneous keys: ${this.format}`,
          'color: green',
        );

        if (formatObj.tags && Object.keys(formatObj.tags).length !== 0) {
          this.formatTags = this.processObject(formatObj.tags);
        }
      }

      if (analysisObj.streams && !!Object.keys(analysisObj.streams).length) {
        const collectedStreams = [];
        const inputStreams = analysisObj.streams;

        inputStreams.forEach((currentStream) => {
          console.log(`%c I'm a stream`, 'color: green');
          collectedStreams.push(this.processObject(currentStream));
        });

        this.streams = collectedStreams;
        // show the panel
        this.isMetadata = true;
      }
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
    const keysArr: string[] = Object.keys(formatObj);
    return keysArr
        // TODO filter if value for key is object or array, rather than not 'tags'
        .filter((formatKey) => formatKey !== 'tags')
        .map((formatKey) => {
          const item: any = {};
          // replace underscores and format with initial caps
          item.key = formatKey
            .replace(/_/g, ' ')
            .replace(/(?:^|\s)[a-z]/g, (m: string) => {
              return m.toUpperCase();
            })
            .replace('Nb ', 'Number of ');
          item.value = formatObj[formatKey];
          return item;
        });
  }

  isItemWithLinearValue(value: any): boolean {
    return typeof value === 'string' || typeof value === 'number';
  }
}
