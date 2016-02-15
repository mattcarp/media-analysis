import {Injectable} from 'angular2/core';

declare var $: any;
declare var FileReader: any;
// initial slice for metadata analysis
const SLICE_SIZE = 150000;

@Injectable()
export class ExtractMetadataService {
  // TODO use the endpoint service
  endpoint: string = "http://localhost:3000/";
  originalExtension: string;

  extract(mediaFile: File) {
    let self = this;
    // let mediafile = this.fileHandlerService.getMediaFile();
    let reader = new FileReader();
    // let blob = this.mediaFile.slice(0, SLICE_SIZE);

    // if we use onloadend, we need to check the readyState.
    reader.onloadend = (evt) => {
      if (evt.target.readyState == FileReader.DONE) { // DONE == 2
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
          contentType: 'application/octet-stream',
          error: function(err) {
            console.log("you have an error on the ajax request:");
            console.log(err);
          },
          success: data => {
            // error handling
            console.log("this is what i got from ffprobe metadata:");
            console.log(data);
            console.log("TODO: render the result in extract-metadata.html")
            self.renderResult(data);

            let analysisObj = JSON.parse(data.analysis);
            let videoBitrate = analysisObj.streams[0].bit_rate;
            let type = analysisObj.streams[0].codec_type;

            if (type === "video") {
              this.processVideo(this.mediaFile, analysisObj);
            }
          }
        });
      }
    };

    // this.mediaFile = file;
    this.originalExtension = mediaFile.name.split(".").pop();
    console.log("original file extension:", this.originalExtension);
    let blob = mediaFile.slice(0, SLICE_SIZE);
    console.log("i believe i can fly");
    reader.readAsBinaryString(blob);
  }
}
