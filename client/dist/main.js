///<reference path="../node_modules/angular2/typings/browser.d.ts"/>
System.register(["angular2/core", "angular2/platform/browser", './detect-black/detect-black.component', './detect-black/detect-black.service'], function(exports_1) {
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, browser_1, detect_black_component_1, detect_black_service_1;
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
            }],
        execute: function() {
            // initial slice for metadata analysis
            SLICE_SIZE = 150000;
            // bit rates from ffmpeg are unreliable, so we have to take a fixed chunk
            // TODO send a smaller chunk then send more if we dont have a black_end
            BLACK_CHUNK_SIZE = 10000000;
            // minimum time, in seconds, for black at head and tail
            MIN_BLACK_TIME = 4;
            AnalysisApp = (function () {
                function AnalysisApp(detectBlackService) {
                    this.detectBlackService = detectBlackService;
                    this.showFormat = false;
                    this.monoDetections = [];
                    this.displayMonoDetails = [];
                    this.endpoint = this.setEndpoint();
                }
                AnalysisApp.prototype.getMetadata = function (target) {
                    var _this = this;
                    var self = this;
                    var files = target.files;
                    var file = files[0];
                    var reader = new FileReader();
                    // if we use onloadend, we need to check the readyState.
                    reader.onloadend = function (evt) {
                        if (evt.target.readyState == FileReader.DONE) {
                            // angular Http doesn't yet support raw binary POSTs
                            // see line 62 at
                            // https://github.com/angular/angular/blob/2.0.0-beta.1/modules/angular2/src/http/static_request.ts
                            $.ajax({
                                type: "POST",
                                url: _this.endpoint + "analysis",
                                data: blob,
                                // don't massage binary to JSON
                                processData: false,
                                // content type that we are sending
                                contentType: 'application/octet-stream',
                                // data type that we expect in return
                                // dataType: "",
                                error: function (err) {
                                    console.log("you have an error on the ajax request:");
                                    console.log(err);
                                },
                                success: function (data) {
                                    // error handling
                                    console.log("this is what i got from ffprobe metadata:");
                                    console.log(data);
                                    self.renderResult(data);
                                    var analysisObj = JSON.parse(data.analysis);
                                    var videoBitrate = analysisObj.streams[0].bit_rate;
                                    var type = analysisObj.streams[0].codec_type;
                                    if (type === "video") {
                                        _this.processVideo(_this.mediaFile, analysisObj);
                                    }
                                }
                            });
                        }
                    };
                    this.mediaFile = file;
                    this.originalExtension = this.mediaFile.name.split(".").pop();
                    console.log("original file extension:", this.originalExtension);
                    var blob = this.mediaFile.slice(0, SLICE_SIZE);
                    reader.readAsBinaryString(blob);
                };
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
                    // TODO calculate middle and end slices
                    var endSliceStart = frontSliceStart * 2;
                    // const endSlice = mediaFile.slice(endSliceStart, endSliceEnd);
                    console.log("in detect mono, my source file is this long:", mediaFile.size);
                    console.log("and the front slice is this long:", frontSlice.size);
                    // console.log("middle slice:", midSlice);
                    console.log("which is based on the video bitrate of", videoBitrate);
                    // TODO use rxjs observable
                    $.when(this.requestMono(frontSlice, "front"))
                        .then(function (data, textStatus, jqXHR) {
                        console.log("first mono detect call is complete:");
                        console.log(data);
                        // this.detectMonoStarted = false;
                        // self.monoDetections.push("bing");
                        // console.log("my detections array", self.monoDetections);
                        // self.monoDetectFront = data;
                    });
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
                AnalysisApp.prototype.changeListener = function ($event) {
                    this.getMetadata($event.target);
                };
                AnalysisApp.prototype.renderResult = function (data) {
                    var _this = this;
                    if (data.error) {
                        this.ffprobeErr = data.error;
                    }
                    console.log("these are my top-level keys");
                    console.log(Object.keys(data));
                    var analysisObj = JSON.parse(data.analysis);
                    console.log("analysis object, and number of keys:");
                    console.log(analysisObj);
                    console.log(Object.keys(analysisObj).length);
                    if (analysisObj && Object.keys(analysisObj).length !== 0) {
                        var formatObj = analysisObj.format;
                        // zone.run(() => { this.showFormat = true});
                        this.showFormat = true;
                        this.format = this.processObject(formatObj);
                        console.log("format object, from which we can filter extraneous keys:");
                        console.log(this.format);
                        if (formatObj.tags && Object.keys(formatObj.tags).length !== 0) {
                            this.formatTags = this.processObject(formatObj.tags);
                        }
                    }
                    if (analysisObj.streams && Object.keys(analysisObj.streams).length !== 0) {
                        var collectedStreams = [];
                        var inputStreams = analysisObj.streams;
                        inputStreams.forEach(function (currentStream) {
                            console.log("i am a stream");
                            collectedStreams.push(_this.processObject(currentStream));
                        });
                        this.streams = collectedStreams;
                    }
                };
                AnalysisApp.prototype.showMonoDetails = function (index) {
                    this.displayMonoDetails[index] = !this.displayMonoDetails[index];
                };
                AnalysisApp.prototype.setEndpoint = function () {
                    if (window.location.hostname === "localhost") {
                        return "http://localhost:3000/";
                    }
                    else {
                        return "http://52.0.119.124:3000/";
                    }
                };
                // takes an object, removes any keys with array values, and returns
                // an array of objects: {key: value}
                // this is handy for ffprobe's format and tags objects
                AnalysisApp.prototype.processObject = function (formatObj) {
                    var keysArr = Object.keys(formatObj);
                    return keysArr
                        .filter(function (formatKey) { return formatKey !== "tags"; })
                        .map(function (formatKey) {
                        var item = {};
                        item.key = formatKey;
                        item.value = formatObj[formatKey];
                        return item;
                    });
                };
                AnalysisApp.prototype.logError = function (err) {
                    console.log("There was an error: ");
                    console.log(err);
                };
                AnalysisApp = __decorate([
                    core_1.Component({
                        selector: "analysis-app",
                        templateUrl: "src/main.html",
                        directives: [detect_black_component_1.DetectBlackComponent],
                        providers: [detect_black_service_1.DetectBlackService]
                    }), 
                    __metadata('design:paramtypes', [detect_black_service_1.DetectBlackService])
                ], AnalysisApp);
                return AnalysisApp;
            })();
            exports_1("AnalysisApp", AnalysisApp);
            browser_1.bootstrap(AnalysisApp);
        }
    }
});
