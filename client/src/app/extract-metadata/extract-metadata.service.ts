import {EventEmitter, Injectable} from '@angular/core';

import {EndpointService} from '../handle-endpoints/endpoint.service';
import {QuicktimeService} from '../shared/services/quicktime.service';

declare var $: any;
declare var FileReader: any;
// initial slice for metadata analysis
const SLICE_SIZE = 150000;

@Injectable({
  providedIn: 'root',
})
export class ExtractMetadataService {
  blob: Blob;
  endpoint: string;
  originalExtension: string;
  qtService;
  metadataStarted = new EventEmitter();
  metadataResult = new EventEmitter();

  constructor(endpointService: EndpointService, qtService: QuicktimeService) {
    this.endpoint = endpointService.getEndpoint();
    this.qtService = qtService;
    console.log('ExtractMetadataService: EndpointService provided this base path:', this.endpoint);
  }

  extract(mediaFile: File) {
    let reader = new FileReader();

    // if we use onloadend, we need to check the readyState.
    reader.onloadend = (evt) => {
      if (evt.target.readyState === FileReader.DONE) { // DONE == 2
        this.metadataStarted.emit(true);

        // TODOmc if extension is .mov, call QuicktimeService.getMoovStats() on header
        if (this.originalExtension === 'mov') {
          // TODO if moov not in head, check tail
          console.log('this is a mov file, so we should call the qt service');
          let headerBuf: ArrayBuffer = evt.target.result;
          let moovStats: any = this.qtService.getMoovStats(headerBuf);
          if (moovStats.moovExists === true) {
            this.handleMov(moovStats, headerBuf);
          } else {
            console.log('don\'t send this to the backend, because we got no moov atom');
            console.log('this is a mov file, but the moov atom wasn\'t found in the header' +
              '. I really should look in the tail of the file now');
            return;
          }

        }
        // angular Http doesn't yet support raw binary POSTs - aha! hey @sergei - this is why i used $.ajax!
        // see line 62 at
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
          error: function(err) {
            console.log('you have an error on the ajax request:');
            console.log(err);
          },
          success: data => {
            // error handling
            console.log('this is what i got from ffprobe metadata:');
            console.log(data);
            this.metadataStarted.emit(false);
            this.metadataResult.emit(data);

            // TODO in main.processVideo, subscribe to the result event, then fire:
            let analysisObj = JSON.parse(data.analysis);
            // let videoBitrate = analysisObj.streams[0].bit_rate;
            let type = analysisObj && analysisObj && analysisObj.streams
              && analysisObj.streams.length && analysisObj.streams[0].codec_type;
            if (type === 'video') {
              console.log('TODO we got a video, now we should fire processVideo()');
              // this.processVideo(this.mediaFile, analysisObj);
            }
          }
        });
      }
    };

    // this.mediaFile = file;
    this.originalExtension = mediaFile.name.split('.').pop();
    console.log('original file extension:', this.originalExtension);
    this.blob = mediaFile.slice(0, SLICE_SIZE);
    reader.readAsArrayBuffer(this.blob);
  }

  // called if file extension is mov, check for moov atom in head, then tail
  handleMov(moovStats: any, movBuf: ArrayBuffer) {
    let moov: ArrayBuffer = this.qtService.getMoov(moovStats.moovStart,
    moovStats.moovLength, movBuf);
    console.log('handleMov gave me this DataView:');
    console.dir(moov);
    let moovMetadata = this.qtService.parseMoov(moov);
    console.log('moov metatadata:');
    console.log(moovMetadata);
  }
}
