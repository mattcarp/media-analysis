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
                                    var analyisObj = JSON.parse(data.analysis);
                                    var bitrate = analyisObj.format.bit_rate;
                                    self.headBlackStarted = true;
                                    self.recursiveBlackDetect(_this.mediaFile, "head");
                                    self.tailBlackStarted = true;
                                    self.recursiveBlackDetect(_this.mediaFile, "tail");
                                    self.detectMono();
                                }
                            });
                        }
                    };
                    this.mediaFile = file;
                    var blob = this.mediaFile.slice(0, SLICE_SIZE);
                    reader.readAsBinaryString(blob);
                };
                AnalysisApp.prototype.changeListener = function ($event) {
                    this.getMetadata($event.target);
                };
                AnalysisApp.prototype.recursiveBlackDetect = function (mediaFile, position, filename) {
                    var _this = this;
                    if (filename === void 0) { filename = this.headBlackFilename; }
                    var MAX_TRIES = 10;
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
                    var BLACK_CHUNK_SIZE = 10000000;
                    var MIN_BLACK_TIME = 4;
                    var sliceStart;
                    var sliceEnd;
                    if (position === "head") {
                        sliceStart = (BLACK_CHUNK_SIZE * this.headBlackTryCount) +
                            this.headBlackTryCount;
                        sliceEnd = sliceStart + BLACK_CHUNK_SIZE;
                        console.log("head try count:", this.headBlackTryCount, "slice start:", sliceStart, "slice end:", sliceEnd);
                    }
                    if (position === "tail") {
                        sliceStart = (BLACK_CHUNK_SIZE * this.tailBlackTryCount) +
                            this.tailBlackTryCount;
                        sliceEnd = sliceStart + BLACK_CHUNK_SIZE;
                        console.log("tail try count:", this.headBlackTryCount, "slice start:", sliceStart, "slice end:", sliceEnd);
                    }
                    var slice = mediaFile.slice(sliceStart, sliceEnd);
                    if (position === "head") {
                        this.blackProgressHead = this.headBlackTryCount / MAX_TRIES;
                    }
                    if (position === "tail") {
                        console.log("ok, i have a tail here, but why does the tail condition not fire on the .when fn?");
                        this.blackProgressTail = this.tailBlackTryCount / MAX_TRIES;
                    }
                    $.when(this.requestBlack(slice, position, filename))
                        .then(function (data, textStatus, jqXHR) {
                        console.log("is my position, insde the where fn, ever tail?");
                        var duration = parseFloat(data.blackDetect[0].duration);
                        console.log("this is my black duration, returned from fancy new requestBlack:");
                        console.log(duration);
                        if (duration >= MIN_BLACK_TIME) {
                            console.log("the detected black duration of", duration, "is greater or equal to the min black time of", MIN_BLACK_TIME);
                            console.log("so we can stop recursing");
                            if (position === "head") {
                                console.log("yo, talking out my head here");
                                _this.headBlackStarted = false;
                                _this.headBlackDetection = data.blackDetect;
                            }
                            if (position === "tail") {
                                console.log("again, the ass-end here, we should have two asses");
                                _this.tailBlackStarted = false;
                                _this.tailBlackDetection = data.blackDetect;
                            }
                            return;
                        }
                        if (position === "head") {
                            _this.headBlackTryCount++;
                        }
                        if (position === "tail") {
                            console.log("we are working on the ass-end, and try count is", _this.tailBlackTryCount);
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
                AnalysisApp.prototype.detectMono = function () {
                    console.log("hiya from the client call to dual mono detection");
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
                    console.log("location hostname:", window.location.hostname);
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
