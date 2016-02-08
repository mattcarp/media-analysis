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
                    this.blackTryCount = 0;
                    this.blackFilename = (Math.random().toString(36) + '00000000000000000').slice(2, 12);
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
                    if (filename === void 0) { filename = this.blackFilename; }
                    var MAX_TRIES = 10;
                    if (this.blackTryCount >= MAX_TRIES) {
                        console.log("max retries exceeded for black detection in file", position);
                        this.headBlackStarted = false;
                        return;
                    }
                    var BLACK_CHUNK_SIZE = 10000000;
                    var MIN_BLACK_TIME = 4;
                    var sliceStart = (BLACK_CHUNK_SIZE * this.blackTryCount) + this.blackTryCount;
                    var sliceEnd = sliceStart + BLACK_CHUNK_SIZE;
                    console.log("try count:", this.blackTryCount, "slice start:", sliceStart, "slice end:", sliceEnd);
                    console.log(this.blackFilename);
                    var slice = mediaFile.slice(sliceStart, sliceEnd);
                    if (position === "head") {
                        this.blackProgressHead = this.blackTryCount / MAX_TRIES;
                    }
                    $.when(this.requestBlack(slice, position, filename))
                        .then(function (data, textStatus, jqXHR) {
                        var duration = parseFloat(data.blackDetect[0].duration);
                        console.log("this is my black duration, returned from fancy new requestBlack:");
                        console.log(duration);
                        if (duration >= MIN_BLACK_TIME) {
                            console.log("the detected black duration of", duration, "is greater or equal to the min black time of", MIN_BLACK_TIME);
                            console.log("so we can stop recursing");
                            _this.headBlackStarted = false;
                            _this.headBlackDetection = data.blackDetect;
                            return;
                        }
                        _this.blackTryCount++;
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
                            console.log("from my fancy new requestBlack, for the", position);
                            console.dir(data.blackDetect);
                        }
                    });
                };
                AnalysisApp.prototype.detectHeadBlack = function (slice, position) {
                    var _this = this;
                    var self = this;
                    var stub = "";
                    var url = this.endpoint + "black";
                    $.ajax({
                        type: "POST",
                        url: url,
                        data: slice,
                        processData: false,
                        contentType: 'application/octet-stream',
                        error: function (err) {
                            console.log("you have an error on the black detection ajax request:");
                            console.log(err);
                        },
                        success: function (data) {
                            var self = _this;
                            var increment = 0;
                            var offset = BLACK_CHUNK_SIZE + 1;
                            console.log("this is what i got from black detection, for the head:");
                            console.dir(data.blackDetect);
                            var blackDur = parseFloat(data.blackDetect[0].duration);
                            console.log("black duration:", blackDur);
                            _this.headBlackDetection = data.blackDetect;
                            _this.headBlackStarted = false;
                            if (blackDur < MIN_BLACK_TIME) {
                                console.log("the detected black duration of", blackDur, "was less than the min black time of", MIN_BLACK_TIME, "So send more money, ma!");
                                var incrementalSlice = self.mediaFile.slice(offset, offset + BLACK_CHUNK_SIZE);
                                $.ajax({
                                    type: "POST",
                                    url: url,
                                    beforeSend: function (request) {
                                        request.setRequestHeader("xa-file-to-concat", data.blackDetect[0].tempFile);
                                    },
                                    data: incrementalSlice,
                                    processData: false,
                                    contentType: 'application/octet-stream',
                                    success: function (data) {
                                        console.log("apparently, the second request was successful: data:");
                                        console.log(data);
                                    }
                                });
                            }
                            var fileLength = self.mediaFile.size;
                            console.log("the file length", fileLength);
                            self.tailBlob = self.mediaFile.slice(fileLength -
                                BLACK_CHUNK_SIZE, fileLength);
                            self.tailBlackStarted = true;
                            self.detectTailBlack(self.tailBlob, "tail");
                        }
                    });
                };
                AnalysisApp.prototype.detectTailBlack = function (slice, position) {
                    var self = this;
                    var stub = "";
                    $.ajax({
                        type: "POST",
                        url: this.endpoint + "black",
                        data: slice,
                        processData: false,
                        contentType: 'application/octet-stream',
                        error: function (err) {
                            console.log("you have an error on the black detection ajax request:");
                            console.log(err);
                        },
                        success: function (data) {
                            console.log("this is what i got from black detect, for the tail:");
                            console.dir(data.blackDetect);
                            self.tailBlackDetection = data.blackDetect;
                            self.tailBlackStarted = false;
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
