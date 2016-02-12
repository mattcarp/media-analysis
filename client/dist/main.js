///<reference path="../node_modules/angular2/typings/browser.d.ts"/>
System.register(["angular2/core", "angular2/platform/browser"], function(exports_1) {
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, browser_1;
    var SLICE_SIZE, BLACK_CHUNK_SIZE, MIN_BLACK_TIME, AnalysisApp;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (browser_1_1) {
                browser_1 = browser_1_1;
            }],
        execute: function() {
            // import {NgIf} from 'angular2/common';
            // import "rxjs/add/operator/map";
            // import "rxjs/add/operator/retry";
            // initial slice for metadata analysis
            SLICE_SIZE = 150000;
            // bit rates from ffmpeg are unreliable, so we have to take a fixed chunk
            // TODO send a smaller chunk then send more if we dont have a black_end
            BLACK_CHUNK_SIZE = 10000000;
            // minimum time, in seconds, for black at head and tail
            MIN_BLACK_TIME = 4;
            AnalysisApp = (function () {
                function AnalysisApp() {
                    this.headBlackTryCount = 0;
                    this.tailBlackTryCount = 0;
                    this.headBlackFilename = (Math.random().toString(36) + '00000000000000000').slice(2, 12);
                    this.tailBlackFilename = (Math.random().toString(36) + '00000000000000000').slice(2, 12);
                    this.showFormat = false;
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
                    var _this = this;
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
                        _this.monoDetectFront = data;
                    });
                    // this.requestMono(frontSlice, "front")
                    //   .subscribe((res) => {
                    //     console.log("did this shit actually work?");
                    //     console.log(res);
                    //     // this.data = res.json();
                    //     // this.loading = false;
                    // });
                };
                AnalysisApp.prototype.requestMono = function (slice, chunkPosition) {
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
                            console.log("from requestMono, for the chunk position", chunkPosition);
                            console.dir(data.blackDetect);
                        }
                    });
                    return promise;
                    // return Observable.fromPromise(promise);
                };
                AnalysisApp.prototype.processVideo = function (mediaFile, bitrate) {
                    // send fixed chunk, then request more bytes and concat if
                    // blackDetect shows a black_start but no black_end
                    // we detect tail black when head black is done, to avoid shared state issue
                    // this.headBlackStarted = true;
                    // this.recursiveBlackDetect(this.mediaFile, "head");
                    //
                    // this.tailBlackStarted = true;
                    // this.recursiveBlackDetect(this.mediaFile, "tail");
                    this.detectMono(this.mediaFile, bitrate);
                };
                AnalysisApp.prototype.changeListener = function ($event) {
                    this.getMetadata($event.target);
                };
                // is called separately for "head" and "tail" (position string)
                AnalysisApp.prototype.recursiveBlackDetect = function (mediaFile, position, headFilename) {
                    var _this = this;
                    if (headFilename === void 0) { headFilename = this.headBlackFilename; }
                    var MAX_TRIES = 20;
                    // use a fixed size chunk as bitrates from ffmpeg are unreliable
                    var BLACK_CHUNK_SIZE = 1000000;
                    // minimum time, in seconds, for black at head and tail
                    var MIN_BLACK_TIME = 3;
                    var sliceStart;
                    var sliceEnd;
                    var tailSliceStart;
                    var tailSliceEnd;
                    // initial stop condition:
                    if (position === "head" && this.headBlackTryCount >= MAX_TRIES) {
                        console.log("max retries exceeded for black detection in file", position);
                        // TODO add alert to DOM
                        this.headBlackStarted = false;
                        return;
                    }
                    if (position === "tail" && this.tailBlackTryCount >= MAX_TRIES) {
                        console.log("max retries exceeded for black detection in file", position);
                        // TODO add alert to DOM
                        this.tailBlackStarted = false;
                        return;
                    }
                    if (position === "head") {
                        sliceStart = (BLACK_CHUNK_SIZE * this.headBlackTryCount) +
                            this.headBlackTryCount;
                        sliceEnd = sliceStart + BLACK_CHUNK_SIZE;
                        console.log("head try count:", this.headBlackTryCount, "slice start:", sliceStart, "slice end:", sliceEnd);
                    }
                    if (position === "tail") {
                        tailSliceEnd = this.mediaFile.size -
                            (BLACK_CHUNK_SIZE * this.tailBlackTryCount) - this.tailBlackTryCount;
                        tailSliceStart = tailSliceEnd - BLACK_CHUNK_SIZE;
                        // sliceEnd = sliceStart + BLACK_CHUNK_SIZE;
                        console.log("tail try count:", this.tailBlackTryCount, "tail slice start:", tailSliceStart, "tail slice end:", tailSliceEnd);
                    }
                    var sliceToUse;
                    if (position === "head") {
                        sliceToUse = mediaFile.slice(sliceStart, sliceEnd);
                    }
                    if (position === "tail") {
                        sliceToUse = mediaFile.slice(tailSliceStart, tailSliceEnd);
                    }
                    if (position === "head") {
                        this.blackProgressHead = this.headBlackTryCount / MAX_TRIES;
                    }
                    if (position === "tail") {
                        this.blackProgressTail = this.tailBlackTryCount / MAX_TRIES;
                    }
                    var fileToUse;
                    if (position === "head") {
                        fileToUse = this.headBlackFilename + "." + this.originalExtension;
                    }
                    if (position === "tail") {
                        fileToUse = this.tailBlackFilename + "." + this.originalExtension;
                    }
                    $.when(this.requestBlack(sliceToUse, position, fileToUse))
                        .then(function (data, textStatus, jqXHR) {
                        if (data.blackDetect[0]) {
                            var duration = parseFloat(data.blackDetect[0].duration);
                            console.log("this is my black duration, returned from requestBlack:");
                            console.log(duration);
                            // stop condition
                            if (duration >= MIN_BLACK_TIME) {
                                console.log("the detected black duration of", duration, "is greater or equal to the min black time of", MIN_BLACK_TIME);
                                console.log("so we can stop recursing");
                                // TODO set tail dom values
                                if (position === "head") {
                                    _this.headBlackStarted = false;
                                    _this.headBlackDetection = data.blackDetect;
                                }
                                if (position === "tail") {
                                    _this.tailBlackStarted = false;
                                    _this.tailBlackDetection = data.blackDetect;
                                }
                                return;
                            }
                        }
                        else {
                            console.log("no blackdetect object on the returned array");
                        }
                        // TODO any additional stop conditions?
                        if (position === "head") {
                            _this.headBlackTryCount++;
                        }
                        if (position === "tail") {
                            console.log("tailBlackTryCount:", _this.tailBlackTryCount);
                            _this.tailBlackTryCount++;
                        }
                        // recurse
                        _this.recursiveBlackDetect(mediaFile, position);
                    });
                };
                AnalysisApp.prototype.requestBlack = function (slice, position, filename) {
                    return $.ajax({
                        type: "POST",
                        url: this.endpoint + "black",
                        data: slice,
                        // don't massage binary to JSON
                        processData: false,
                        // content type that we are sending
                        contentType: 'application/octet-stream',
                        beforeSend: function (request) {
                            request.setRequestHeader("xa-file-to-concat", filename);
                            request.setRequestHeader("xa-black-position", position);
                        },
                        error: function (err) {
                            console.log("error on the black detection ajax request:");
                            console.log(err);
                        },
                        success: function (data) {
                            console.log("from requestBlack, for the", position);
                            console.dir(data.blackDetect);
                        }
                    });
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
                    }), 
                    __metadata('design:paramtypes', [])
                ], AnalysisApp);
                return AnalysisApp;
            })();
            exports_1("AnalysisApp", AnalysisApp);
            browser_1.bootstrap(AnalysisApp);
        }
    }
});
