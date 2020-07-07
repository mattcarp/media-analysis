System.register(["angular2/core", "../handle-endpoints/endpoint.service", "../shared/services/quicktime.service"], function (exports_1, context_1) {
    "use strict";
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, endpoint_service_1, quicktime_service_1, SLICE_SIZE, ExtractMetadataService;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (endpoint_service_1_1) {
                endpoint_service_1 = endpoint_service_1_1;
            },
            function (quicktime_service_1_1) {
                quicktime_service_1 = quicktime_service_1_1;
            }
        ],
        execute: function () {
            // initial slice for metadata analysis
            SLICE_SIZE = 150000;
            ExtractMetadataService = /** @class */ (function () {
                function ExtractMetadataService(endpointService, qtService) {
                    this.metadataStarted = new core_1.EventEmitter();
                    this.metadataResult = new core_1.EventEmitter();
                    this.endpoint = endpointService.getEndpoint();
                    this.qtService = qtService;
                    console.log('ExtractMetadataService: EndpointService provided this base path:', this.endpoint);
                }
                ExtractMetadataService.prototype.extract = function (mediaFile) {
                    var _this = this;
                    var reader = new FileReader();
                    // if we use onloadend, we need to check the readyState.
                    reader.onloadend = function (evt) {
                        if (evt.target.readyState === FileReader.DONE) { // DONE == 2
                            _this.metadataStarted.emit(true);
                            // TODOmc if extension is .mov, call QuicktimeService.getMoovStats() on header
                            if (_this.originalExtension === 'mov') {
                                // TODO if moov not in head, check tail
                                console.log('this is a mov file, so we should call the qt service');
                                var headerBuf = evt.target.result;
                                var moovStats = _this.qtService.getMoovStats(headerBuf);
                                if (moovStats.moovExists === true) {
                                    _this.handleMov(moovStats, headerBuf);
                                }
                                else {
                                    console.log('don\'t send this to the backend, because we got no moov atom');
                                    console.log('this is a mov file, but the moov atom wasn\'t found in the header' +
                                        '. I really should look in the tail of the file now');
                                    return;
                                }
                            }
                            // angular Http doesn't yet support raw binary POSTs
                            // see line 62 at
                            // https://github.com/angular/angular/blob/2.0.0-beta.1/modules/angular2/src/http/static_request.ts
                            $.ajax({
                                type: 'POST',
                                url: _this.endpoint + 'analysis',
                                // TODOmc isn't this.blob just an empty slice?
                                data: _this.blob,
                                // don't massage binary to JSON
                                processData: false,
                                // content type that we are sending
                                contentType: 'application/octet-stream',
                                error: function (err) {
                                    console.log('you have an error on the ajax request:');
                                    console.log(err);
                                },
                                success: function (data) {
                                    // error handling
                                    console.log('this is what i got from ffprobe metadata:');
                                    console.log(data);
                                    _this.metadataStarted.emit(false);
                                    _this.metadataResult.emit(data);
                                    // TODO in main.processVideo, subscribe to the result event, then fire:
                                    var analysisObj = JSON.parse(data.analysis);
                                    // let videoBitrate = analysisObj.streams[0].bit_rate;
                                    var type = analysisObj.streams[0].codec_type;
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
                };
                // called if file extension is mov, check for moov atom in head, then tail
                ExtractMetadataService.prototype.handleMov = function (moovStats, movBuf) {
                    var moov = this.qtService.getMoov(moovStats.moovStart, moovStats.moovLength, movBuf);
                    console.log('handleMov gave me this DataView:');
                    console.dir(moov);
                    var moovMetadata = this.qtService.parseMoov(moov);
                    console.log('moov metatadata:');
                    console.log(moovMetadata);
                };
                ExtractMetadataService = __decorate([
                    core_1.Injectable(),
                    __metadata("design:paramtypes", [endpoint_service_1.EndpointService, quicktime_service_1.QuicktimeService])
                ], ExtractMetadataService);
                return ExtractMetadataService;
            }());
            exports_1("ExtractMetadataService", ExtractMetadataService);
        }
    };
});
//# sourceMappingURL=extract-metadata.service.js.map