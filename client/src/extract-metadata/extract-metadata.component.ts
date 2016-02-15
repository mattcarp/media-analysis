import {Component} from 'angular2/core';

import {ExtractMetadataService} from './extract-metadata.service';

declare var $: any;

@Component({
  selector: 'extract-metadata',
  templateUrl: 'src/extract-metadata/extract-metadata.html',
})

export class ExtractMetadataComponent {
  metadataStarted: any; // the event emitter
  metadataResult: any;
  metadataLoading: boolean;
  metadata: Object;
  ffprobeErr: string;
  format: Object[];
  formatTags: Object[];
  showFormat: boolean = false;
  streams: Object[][]; // an array of arrays of stream objects

  constructor(extractMetadataService: ExtractMetadataService) {
    this.metadataLoading = false;
    this.metadataStarted = extractMetadataService.metadataStarted;
    this.metadataStarted.subscribe(value => {
      if (value === true) { console.log("oh my fucking god we went to true"); }
      this.metadataLoading = value;
    });
    this.metadataResult = extractMetadataService.metadataResult;
    this.metadataResult.subscribe(value => {
      this.renderResult(value);
    });
    // detectBlackService.headBlackStarted.subscribe(value => {
    //   this.headBlackStarted = value;
    // });
    // detectBlackService.tailBlackStarted.subscribe(value => {
    //   this.tailBlackStarted = value;
    // });
    // detectBlackService.headProgress.subscribe(value => {
    //   this.headBlackProgress = value;
    // });
    // detectBlackService.tailProgress.subscribe(value => {
    //   this.tailBlackProgress = value;
    // });
    // detectBlackService.headBlackResult.subscribe(value => {
    //   this.headBlackResult = value;
    // });

  }

  ngOnit() {
    if (this.metadataStarted) { console.log("oh my fucking god it works"); }
    console.log("you have called the init function on extract meta component");
    this.metadataStarted = false;
    this.metadataStarted.subscribe(value => {
      if (value === true) { console.log("oh my fucking god we went to true"); }
      this.metadataStarted = value;

    });
    // this.extractMetadataService.metadataResult.subscribe(value => {
    //   this.metadataResult = value;
    // });

    if (this.metadataStarted === true) {
      console.log("it is started! (metadata)");
    }
    if (this.metadataResult) {
      this.renderResult(this.metadataResult);
    }
  }

  renderResult(data) {
    if (data.error) {
      this.ffprobeErr = data.error;
    }
    console.log("these are my top-level keys");
    console.log(Object.keys(data));
    let analysisObj = JSON.parse(data.analysis);
    console.log("analysis object, and number of keys:");
    console.log(analysisObj);
    console.log(Object.keys(analysisObj).length);
    if (analysisObj && Object.keys(analysisObj).length !== 0) {
      let formatObj = analysisObj.format;
      // zone.run(() => { this.showFormat = true});
      this.showFormat = true;
      this.format = this.processObject(formatObj);
      console.log("format object, from which we can filter extraneous keys:")
      console.log(this.format);

      if (formatObj.tags && Object.keys(formatObj.tags).length !== 0) {
        this.formatTags = this.processObject(formatObj.tags);
      }
    }

    if (analysisObj.streams && Object.keys(analysisObj.streams).length !== 0) {
      let collectedStreams = [];
      let inputStreams = analysisObj.streams;
      inputStreams.forEach(currentStream => {
        console.log("i am a stream");
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
    let keysArr: string[] = Object.keys(formatObj);
    return keysArr
    // TODO filter if value for key is object or array, rather than not 'tags'
      .filter(formatKey => formatKey !== "tags")
      .map(formatKey => {
      let item: any = {};
      item.key = formatKey;
      item.value = formatObj[formatKey];
      return item;
    })
  }

}
