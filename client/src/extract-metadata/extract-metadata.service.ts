import {EventEmitter, Injectable} from "angular2/core";

import {EndpointService} from "../handle-endpoints/endpoint.service";

declare var $: any;
declare var FileReader: any;
// initial slice for metadata analysis
const SLICE_SIZE = 150000;

@Injectable()
export class ExtractMetadataService {
  endpoint: string;
  originalExtension: string;
  metadataStarted = new EventEmitter();
  metadataResult = new EventEmitter();

  constructor(endpointService: EndpointService) {
    this.endpoint = endpointService.getEndpoint();
    console.log("ExtractMetadataService: EndpointService provided this base path:", this.endpoint);
  }

  extract(mediaFile: File) {
    let self = this;
    let reader = new FileReader();

    // if we use onloadend, we need to check the readyState.
    reader.onloadend = (evt) => {
      if (evt.target.readyState === FileReader.DONE) { // DONE == 2
        console.log("we should now be emitting metadata started = true");
        this.metadataStarted.emit(true);
        // angular Http doesn't yet support raw binary POSTs
        // see line 62 at
        // https://github.com/angular/angular/blob/2.0.0-beta.1/modules/angular2/src/http/static_request.ts
        $.ajax({
          type: "POST",
          url: this.endpoint + "analysis",
          data: blob,
          // don't massage binary to JSON
          processData: false,
          // content type that we are sending
          contentType: "application/octet-stream",
          error: function(err) {
            console.log("you have an error on the ajax request:");
            console.log(err);
          },
          success: data => {
            // error handling
            console.log("this is what i got from ffprobe metadata:");
            console.log(data);
            this.metadataStarted.emit(false);
            this.metadataResult.emit(data);


            // TODO in main.processVideo, subscribe to the result event, then fire:
            let analysisObj = JSON.parse(data.analysis);
            let videoBitrate = analysisObj.streams[0].bit_rate;
            let type = analysisObj.streams[0].codec_type;
            if (type === "video") {
              console.log("we got a video, hoss, now we gotta fire processVideo()");
              // this.processVideo(this.mediaFile, analysisObj);
            }
          }
        });
      }
    };

    // this.mediaFile = file;
    this.originalExtension = mediaFile.name.split(".").pop();
    console.log("original file extension:", this.originalExtension);
    let blob = mediaFile.slice(0, SLICE_SIZE);
    reader.readAsBinaryString(blob);
  }
}
