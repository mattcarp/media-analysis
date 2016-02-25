import {Component} from "angular2/core";

import {ExtractMetadataService} from '../extract-metadata/extract-metadata.service';

declare var $: any;

@Component({
  selector: 'validate-format',
  templateUrl: 'src/validate-format/validate-format.html',
})

export class ValidateFormatComponent {
  metadataStarted: boolean;
  metadataResult: any;
  showResults: boolean;
  audioValidations: Object[] = [];
  videoValidations: Object[] = [];
  isProRes: boolean = false;
  videoFormat: string;


  constructor(extractMetadataService: ExtractMetadataService) {
    extractMetadataService.metadataStarted.subscribe(value => {
      this.metadataStarted = value;
    });
    extractMetadataService.metadataResult.subscribe(value => {
      this.metadataStarted = false;
      this.validate(value);
    });
  }

  validate(metadata: any) {
    const ACCEPTED_FRAME_RATES = [29.97, 24, 23.976, 25, 30];
    const ACCEPTED_VIDEO_CODECS = ["prores", "mpeg2video", "h264"];
    // the allowed lossy formats will have a bit depth of 0
    const ACCEPTED_BIT_DEPTHS = [0, 16];
    const ACCEPTED_AUDIO_CODECS = ["pcm_s16be", "aac"]

    const analysisObj = JSON.parse(metadata.analysis);


    // build audio validations array
    // TODO possibly use a reduce function on the streams array...
    // if   "codec_type": "audio", etc

    // TODO get index number of stream with codec_type === "audio",
    // rather than hard-codiing
    const audioStream = analysisObj.streams[1];

    this.audioValidations.push({
      name: "Bit Depth",
      value: audioStream.bits_per_sample,
      pass: ACCEPTED_BIT_DEPTHS.indexOf(audioStream.bits_per_sample) > - 1,
      message: "Audio bit depth must be 16 bits."
    });

    this.audioValidations.push({
      name: "Sample Rate",
      value: audioStream.sample_rate,
      pass: audioStream.sample_rate === "48000",
      message: "Audio sample rate must be 48kHz."
    });

    this.audioValidations.push({
      name: "Channel Layout",
      value: audioStream.channel_layout,
      pass: audioStream.channel_layout === "stereo",
      message: "Audio channel layout must be stereo."
    });

    this.audioValidations.push({
      name: "Channel Count",
      value: audioStream.channels,
      pass: audioStream.channels === 2,
      message: "There must be 2 audio channels."
    });

    this.audioValidations.push({
      name: "Codec",
      value: audioStream.codec_long_name,
      // pass: audioStream.codec_long_name === "PCM signed 16-bit big-endian",
      pass: ACCEPTED_AUDIO_CODECS.indexOf(audioStream.codec_name) > - 1,
      message: "Audio must be either 16 bit PCM or AAC."
    });

    // TODO get index of first stream with codec_type === "video",
    // rather than hard-coding this as index 0
    const videoStream = analysisObj.streams[0];
    this.isProRes = videoStream.codec_long_name === "ProRes";
    this.videoFormat = videoStream.codec_name;

    this.videoValidations.push({
      name: "Codec",
      value: videoStream.codec_long_name.substring(0, 20),
      // TODO ProRess and mpeg2 are a pass, but h.264 and Avid DNX HD
      // are allowed, with a warning message
      pass: ACCEPTED_VIDEO_CODECS.indexOf(videoStream.codec_name) > - 1,
      // pass: videoStream.codec_long_name === "ProRes",
      message: "Video codec must be ProRes, MPEG-2, H.264, or Avid DNX HD."
    });

    this.videoValidations.push({
      name: "Height",
      value: videoStream.height,
      pass: videoStream.height === 1080,
      message: "Height must be 1080 pixels."
    });

    this.videoValidations.push({
      name: "Width",
      value: videoStream.width,
      pass: videoStream.width === 1920,
      message: "Width must be 1920 pixels."
    });

    if (this.isProRes) {
      this.videoValidations.push({
        name: "Encoder",
        value: videoStream.tags.encoder,
        pass: videoStream.tags.encoder === "Apple ProRes 422 (HQ)",
        message: "ProRes must use the Apple 422 HQ encoder"
      });
    }

    let operands = videoStream.r_frame_rate.split("/");
    let framerate = operands[0] / operands[1];
    console.log("valide-fomate: computed framerate:", framerate);
    this.videoValidations.push({
      name: "Frame Rate",
      value: framerate,
      pass: ACCEPTED_FRAME_RATES.indexOf(framerate) > - 1,
      message: "Frame rate must be either 23.976, 24, 25, 29.97, or 30."
    });

    this.showResults = true;
  }

}
