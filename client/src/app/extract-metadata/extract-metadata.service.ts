import { EventEmitter, Injectable } from '@angular/core';

import { EndpointService } from '../services/endpoint.service';
import { QuicktimeService } from '../services/quicktime.service';
import { IMoovStats } from '../services/quicktime.service';
import { LoggerService } from '../services/logger.service';

declare let $: any;
declare let FileReader: any;
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

  constructor(
    endpointService: EndpointService,
    qtService: QuicktimeService,
    private loggerService: LoggerService,
  ) {
    this.endpoint = endpointService.getEndpoint();
    this.qtService = qtService;
    this.loggerService.info(
      `EndpointService provided this base path: ${this.endpoint}`,
      'color: lime',
    );
  }

  extract(mediaFile: File): void {
    const reader = new FileReader();

    // if we use onloadend, we need to check the readyState.
    reader.onloadend = (evt) => {
      if (evt.target.readyState === FileReader.DONE) {
        // DONE == 2
        this.metadataStarted.emit(true);

        // TODOmc if extension is .mov, call QuicktimeService.getMoovStats() on header
        if (this.originalExtension === 'mov') {
          // TODO if moov not in head, check tail
          this.loggerService.info(`This is a mov file, so we should call the qt service.`, 'color: grey');
          const headerBuf: ArrayBuffer = evt.target.result;
          const moovStats: any = this.qtService.getMoovStats(headerBuf);
          if (moovStats.moovExists === true) {
            this.handleMov(moovStats, headerBuf);
          } else {
            this.loggerService.info(`Don't send this to the backend, because we got no moov atom.`, 'color: orange');
            this.loggerService.info(
              `This is a mov file, but the moov atom wasn't found in the header. I really should look in the tail of the file now.`,
              'color: grey',
            );
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
          error: (err) => {
            this.loggerService.info(`You have an error on the ajax request:`, 'color: red');
            console.log(err);
          },
          success: (data) => {
            // error handling
            this.loggerService.info(`This is what I got from ffprobe metadata:`, 'color: darkgrey');
            this.loggerService.debug(`\t error: ${data.error}`, 'color: red');
            this.loggerService.debug(`\t analysis: ${data.analysis}`, 'color: grey');

            this.metadataStarted.emit(false);
            this.metadataResult.emit(data);

            // TODO in main.processVideo, subscribe to the result event, then fire:
            const analysisObj = JSON.parse(data.analysis);
            // let videoBitrate = analysisObj.streams[0].bit_rate;
            const type = analysisObj?.streams?.length && analysisObj.streams[0].codec_type;
            if (type === 'video') {
              this.loggerService.info(`TODO we got a video, now we should fire processVideo()`, 'color: lime');
              // this.processVideo(this.mediaFile, analysisObj);
            }
          },
        });
      }
    };

    // this.mediaFile = file;
    this.originalExtension = mediaFile.name.split('.').pop();
    this.loggerService.info(
      `Original file extension: ${this.originalExtension}`,
      'color: lawngreen ',
    );
    this.blob = mediaFile.slice(0, SLICE_SIZE);
    reader.readAsArrayBuffer(this.blob);
  }

  // called if file extension is mov, check for moov atom in head, then tail
  handleMov(moovStats: IMoovStats, movBuf: ArrayBuffer): void {
    const moov: ArrayBuffer = this.qtService.getMoov(moovStats.moovStart, moovStats.moovLength, movBuf);
    this.loggerService.info(`HandleMov gave me this DataView:`, 'color: grey');
    console.dir(moov);

    const moovMetadata = this.qtService.parseMoov(moov);
    this.loggerService.info(`Moov metatadata:`, 'color: grey');
    console.log(moovMetadata);
  }
}
