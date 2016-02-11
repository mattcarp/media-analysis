System.register(["angular2/core", "angular2/platform/browser", "rxjs/add/operator/map", "rxjs/add/operator/retry"], function(exports_1) {
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
            },
            function (_1) {},
            function (_2) {}],
        execute: function() {
            SLICE_SIZE = 150000;
            BLACK_CHUNK_SIZE = 10000000;
            MIN_BLACK_TIME = 4;
            AnalysisApp = (function () {
                function AnalysisApp() {
                    this.headBlackTryCount = 0;
                    this.tailBlackTryCount = 0;
                    this.headBlackFilename = (Math.random().toString(36) + '00000000000000000').slice(2, 12);
                    this.tailBlackFilename = (Math.random().toString(36) + '00000000000000000').slice(2, 12);
                    this.endpoint = this.setEndpoint();
                }
                AnalysisApp.prototype.getMetadata = function (target) {
                    var _this = this;
                    var self = this;
                    var files = target.files;
                    var file = files[0];
                    var reader = new FileReader();
                    reader.onloadend = function (evt) {
                        if (evt.target.readyState == FileReader.DONE) {
                            $.ajax({
                                type: "POST",
                                url: _this.endpoint + "analysis",
                                data: blob,
                                processData: false,
                                contentType: 'application/octet-stream',
                                error: function (err) {
                                    console.log("you have an error on the ajax requst:");
                                    console.log(err);
                                },
                                success: function (data) {
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
                    console.log("hiya from the client call to dual mono detection");
                    var videoBitrate = bitrate | 25000000;
                    var MONO_CHUNK_SIZE = Math.floor((videoBitrate * 1.1) / 8);
                    console.log("mono chunk size", MONO_CHUNK_SIZE);
                    var length = mediaFile.size;
                    var frontSliceStart = Math.floor(length / 3);
                    var frontSliceEnd = frontSliceStart + MONO_CHUNK_SIZE;
                    var frontSlice = mediaFile.slice(frontSliceStart, frontSliceEnd);
                    console.log("in detect mono, my source file is this long:", mediaFile.size);
                    console.log("and the front slice is this long:", frontSlice.size);
                    console.log("which is based on the video bitrate of", videoBitrate);
                    $.when(this.requestMono(frontSlice, "front"))
                        .then(function (data, textStatus, jqXHR) {
                        console.log("i think your first mono detect call is complete, now do the middle:");
                        console.log(data);
                    });
                };
                AnalysisApp.prototype.requestMono = function (slice, chunkPosition) {
                    var promise = $.ajax({
                        type: "POST",
                        url: this.endpoint + "mono",
                        data: slice,
                        processData: false,
                        contentType: 'application/octet-stream',
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
                };
                AnalysisApp.prototype.processVideo = function (mediaFile, bitrate) {
                    this.detectMono(this.mediaFile, bitrate);
                };
                AnalysisApp.prototype.changeListener = function ($event) {
                    this.getMetadata($event.target);
                };
                AnalysisApp.prototype.recursiveBlackDetect = function (mediaFile, position, headFilename) {
                    var _this = this;
                    if (headFilename === void 0) { headFilename = this.headBlackFilename; }
                    var MAX_TRIES = 20;
                    var BLACK_CHUNK_SIZE = 1000000;
                    var MIN_BLACK_TIME = 3;
                    var sliceStart;
                    var sliceEnd;
                    var tailSliceStart;
                    var tailSliceEnd;
                    if (position === "head" && this.headBlackTryCount >= MAX_TRIES) {
                        console.log("max retries exceeded for black detection in file", position);
                        this.headBlackStarted = false;
                        return;
                    }
                    if (position === "tail" && this.tailBlackTryCount >= MAX_TRIES) {
                        console.log("max retries exceeded for black detection in file", position);
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
                            console.log("this is my black duration, returned from fancy new requestBlack:");
                            console.log(duration);
                            if (duration >= MIN_BLACK_TIME) {
                                console.log("the detected black duration of", duration, "is greater or equal to the min black time of", MIN_BLACK_TIME);
                                console.log("so we can stop recursing");
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
                        if (position === "head") {
                            _this.headBlackTryCount++;
                        }
                        if (position === "tail") {
                            console.log("tailBlackTryCount:", _this.tailBlackTryCount);
                            _this.tailBlackTryCount++;
                        }
                        _this.recursiveBlackDetect(mediaFile, position);
                    });
                };
                AnalysisApp.prototype.requestBlack = function (slice, position, filename) {
                    return $.ajax({
                        type: "POST",
                        url: this.endpoint + "black",
                        data: slice,
                        processData: false,
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
                        this.format = this.processObject(formatObj);
                        console.log("format object, from which we can filter extraneous keys:");
                        console.log(formatObj);
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
                        templateUrl: "src/main.html"
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
