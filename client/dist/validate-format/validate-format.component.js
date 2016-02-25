System.register(["angular2/core", '../extract-metadata/extract-metadata.service'], function(exports_1) {
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, extract_metadata_service_1;
    var ValidateFormatComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (extract_metadata_service_1_1) {
                extract_metadata_service_1 = extract_metadata_service_1_1;
            }],
        execute: function() {
            ValidateFormatComponent = (function () {
                function ValidateFormatComponent(extractMetadataService) {
                    var _this = this;
                    this.audioValidations = [];
                    this.videoValidations = [];
                    this.isProRes = false;
                    extractMetadataService.metadataStarted.subscribe(function (value) {
                        _this.metadataStarted = value;
                    });
                    extractMetadataService.metadataResult.subscribe(function (value) {
                        _this.metadataStarted = false;
                        _this.validate(value);
                    });
                }
                ValidateFormatComponent.prototype.validate = function (metadata) {
                    // TODO calculate framrates as floats
                    var ACCEPTED_FRAME_RATES = [29.97, 24, 23.976, 25, 30];
                    var ACCEPTED_FILE_FORMATS = ["prores", "mpeg2video", "h264"];
                    var analysisObj = JSON.parse(metadata.analysis);
                    // build audio validations array
                    // TODO possibly use a reduce function on the streams array...
                    // if   "codec_type": "audio", etc
                    // TODO get index number of stream with codec_type === "audio",
                    // rather than hard-codiing
                    var audioStream = analysisObj.streams[1];
                    this.audioValidations.push({
                        name: "Bit Depth",
                        value: audioStream.bits_per_sample,
                        // mp2 has 0 bits per sample, so we use sample_fmt
                        pass: audioStream.bits_per_sample === 16,
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
                        pass: audioStream.codec_long_name === "PCM signed 16-bit big-endian",
                        message: "Audio must be uncompressed (PCM)."
                    });
                    // TODO get index of first stream with codec_type === "video",
                    // rather than hard-coding this as index 0
                    var videoStream = analysisObj.streams[0];
                    this.isProRes = videoStream.codec_long_name === "ProRes";
                    this.videoFormat = videoStream.codec_name;
                    // build video validations array
                    this.videoValidations.push({
                        name: "Codec",
                        value: videoStream.codec_long_name,
                        // TODO ProRess and mpeg2 are a pass, but h.264 and Avid DNX HD
                        // are allowed, with a warning message
                        // match on the short
                        pass: ACCEPTED_FILE_FORMATS.indexOf(videoStream.codec_name) > -1,
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
                    this.videoValidations.push({
                        name: "Frame Rate",
                        value: parseFloat(videoStream.r_frame_rate),
                        pass: ACCEPTED_FRAME_RATES.indexOf(parseFloat(videoStream.r_frame_rate)) > -1,
                        message: "Frame rate must be either 23.976, 24, 25, 29.97, or 30."
                    });
                    this.showResults = true;
                };
                ValidateFormatComponent = __decorate([
                    core_1.Component({
                        selector: 'validate-format',
                        templateUrl: 'src/validate-format/validate-format.html',
                    }), 
                    __metadata('design:paramtypes', [extract_metadata_service_1.ExtractMetadataService])
                ], ValidateFormatComponent);
                return ValidateFormatComponent;
            })();
            exports_1("ValidateFormatComponent", ValidateFormatComponent);
        }
    }
});
