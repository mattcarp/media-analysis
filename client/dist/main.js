///<reference path="../node_modules/angular2/typings/browser.d.ts"/>
System.register(["angular2/core", "angular2/platform/browser", './detect-black/detect-black.component', './detect-black/detect-black.service', './handle-files/handle-files.component', './extract-metadata/extract-metadata.component', "./handle-files/handle-files.service", "./extract-metadata/extract-metadata.service"], function(exports_1) {
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, browser_1, detect_black_component_1, detect_black_service_1, handle_files_component_1, extract_metadata_component_1, handle_files_service_1, extract_metadata_service_1;
    var SLICE_SIZE, BLACK_CHUNK_SIZE, MIN_BLACK_TIME, AnalysisApp;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (browser_1_1) {
                browser_1 = browser_1_1;
            },
            function (detect_black_component_1_1) {
                detect_black_component_1 = detect_black_component_1_1;
            },
            function (detect_black_service_1_1) {
                detect_black_service_1 = detect_black_service_1_1;
            },
            function (handle_files_component_1_1) {
                handle_files_component_1 = handle_files_component_1_1;
            },
            function (extract_metadata_component_1_1) {
                extract_metadata_component_1 = extract_metadata_component_1_1;
            },
            function (handle_files_service_1_1) {
                handle_files_service_1 = handle_files_service_1_1;
            },
            function (extract_metadata_service_1_1) {
                extract_metadata_service_1 = extract_metadata_service_1_1;
            }],
        execute: function() {
            // initial slice for metadata analysis
            SLICE_SIZE = 150000;
            // bit rates from ffmpeg are unreliable, so we have to take a fixed chunk
            BLACK_CHUNK_SIZE = 10000000;
            // minimum time, in seconds, for black at head and tail
            MIN_BLACK_TIME = 4;
            AnalysisApp = (function () {
                // streams: Object[][]; // an array of arrays of stream objects
                function AnalysisApp(detectBlackService, fileHandlerService) {
                    this.detectBlackService = detectBlackService;
                    // showFormat: boolean = false;
                    this.monoDetections = [];
                    this.displayMonoDetails = [];
                    // TODO call the endpoint service
                    this.fileHandlerService = fileHandlerService;
                    this.endpoint = this.setEndpoint();
                }
                AnalysisApp.prototype.detectMono = function (mediaFile, bitrate) {
                    // if bitrate is undefined, assume 25mbps
                    var videoBitrate = bitrate | 25000000;
                    // video bitrate is a bit smaller than overall bitrate
                    var MONO_CHUNK_SIZE = Math.floor((videoBitrate * 1.1) / 8);
                    console.log("mono chunk size", MONO_CHUNK_SIZE);
                    var length = mediaFile.size;
                    var frontSliceStart = Math.floor(length / 3);
                    var frontSliceEnd = frontSliceStart + MONO_CHUNK_SIZE;
                    var frontSlice = mediaFile.slice(frontSliceStart, frontSliceEnd);
                    // TODO calculate middle slice
                    var midSliceStart = Math.floor(length / 2) - (MONO_CHUNK_SIZE / 2);
                    var midSliceEnd = midSliceStart + MONO_CHUNK_SIZE;
                    var midSlice = mediaFile.slice(midSliceStart, midSliceEnd);
                    var endSliceStart = frontSliceStart * 2;
                    var endSliceEnd = endSliceStart + MONO_CHUNK_SIZE;
                    var endSlice = mediaFile.slice(endSliceStart, endSliceEnd);
                    console.log("in detect mono, my source file is this long:", mediaFile.size);
                    console.log("and the front slice is this long:", frontSlice.size);
                    // console.log("middle slice:", midSlice);
                    console.log("which is based on the video bitrate of", videoBitrate);
                    // TODO use rxjs observable
                    $.when(this.requestMono(frontSlice, "front"))
                        .then(function (data, textStatus, jqXHR) {
                        console.log("first mono detect call is complete:");
                        console.log(data);
                    })
                        .then(this.requestMono(midSlice, "middle"))
                        .then(function (data, textStatus, jqXHR) {
                        console.log("second (middle) mono detect call should be done:");
                        console.log(data);
                    });
                    // .then(this.requestMono(endSlice, "end"))
                    // .then((data, textStatus, jqXHR) => {
                    //   console.log("final mono detect call should be done:");
                    //   console.log(data);
                    // });
                };
                AnalysisApp.prototype.requestMono = function (slice, chunkPosition) {
                    var _this = this;
                    var self = this;
                    var promise = $.ajax({
                        type: "POST",
                        url: this.endpoint + "mono",
                        data: slice,
                        // don't massage binary to JSON
                        processData: false,
                        // content type that we are sending
                        contentType: 'application/octet-stream',
                        // add any custom headers
                        beforeSend: function (request) {
                            request.setRequestHeader("xa-chunk-position", chunkPosition);
                        },
                        error: function (err) {
                            console.log("error on the mono detection ajax request for chunk", chunkPosition);
                            console.log(err);
                        },
                        success: function (data) {
                            _this.monoDetections.push(data);
                            console.log("mono detection array:");
                            console.dir(_this.monoDetections);
                        }
                    });
                    return promise;
                    // return Observable.fromPromise(promise);
                };
                AnalysisApp.prototype.showMonoDetails = function (index) {
                    this.displayMonoDetails[index] = !this.displayMonoDetails[index];
                };
                AnalysisApp.prototype.processVideo = function (mediaFile, bitrate) {
                    // send fixed chunk, then request more bytes and concat if
                    // blackDetect shows a black_start but no black_end
                    // this.headBlackStarted = true;
                    this.detectBlackService.recursiveBlackDetect(mediaFile, "head");
                    // this.tailBlackStarted = true;
                    this.detectBlackService.recursiveBlackDetect(mediaFile, "tail");
                    this.monoDetectStarted = true;
                    this.detectMono(this.mediaFile, bitrate);
                };
                AnalysisApp.prototype.setEndpoint = function () {
                    if (window.location.hostname === "localhost") {
                        return "http://localhost:3000/";
                    }
                    else {
                        return "http://52.0.119.124:3000/";
                    }
                };
                AnalysisApp.prototype.logError = function (err) {
                    console.log("There was an error: ");
                    console.log(err);
                };
                AnalysisApp = __decorate([
                    core_1.Component({
                        selector: "analysis-app",
                        templateUrl: "src/main.html",
                        directives: [detect_black_component_1.DetectBlackComponent, handle_files_component_1.HandleFilesComponent,
                            extract_metadata_component_1.ExtractMetadataComponent],
                        providers: [detect_black_service_1.DetectBlackService, handle_files_service_1.FileHandlerService, extract_metadata_service_1.ExtractMetadataService]
                    }), 
                    __metadata('design:paramtypes', [detect_black_service_1.DetectBlackService, handle_files_service_1.FileHandlerService])
                ], AnalysisApp);
                return AnalysisApp;
            })();
            exports_1("AnalysisApp", AnalysisApp);
            browser_1.bootstrap(AnalysisApp);
        }
    }
});
