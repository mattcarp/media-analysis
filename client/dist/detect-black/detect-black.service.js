System.register(['angular2/core'], function(exports_1) {
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1;
    var DetectBlackService;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            }],
        execute: function() {
            DetectBlackService = (function () {
                function DetectBlackService() {
                    this.headBlackStarted = new core_1.EventEmitter();
                    this.tailBlackStarted = new core_1.EventEmitter();
                    this.headBlackResult = new core_1.EventEmitter();
                    this.tailBlackResult = new core_1.EventEmitter();
                    // mediaFile: File;
                    this.headBlackTryCount = 0;
                    this.tailBlackTryCount = 0;
                    this.headBlackFilename = (Math.random().toString(36) + '00000000000000000').slice(2, 12);
                    this.tailBlackFilename = (Math.random().toString(36) + '00000000000000000').slice(2, 12);
                    this.headProgress = new core_1.EventEmitter();
                    this.tailProgress = new core_1.EventEmitter();
                    // TODO - this is temp - should call a getEndpoint() service
                    this.endpoint = "http://localhost:3000/";
                    this.MAX_TRIES = 20;
                    // use a fixed size chunk as bitrates from ffmpeg are unreliable
                    this.BLACK_CHUNK_SIZE = 1000000;
                    // minimum time, in seconds, for black at head and tail
                    this.MIN_BLACK_TIME = 3;
                }
                // is called separately for "head" and "tail" (position string)
                DetectBlackService.prototype.recursiveBlackDetect = function (mediaFile, position) {
                    var _this = this;
                    var sliceStart;
                    var sliceEnd;
                    var tailSliceStart;
                    var tailSliceEnd;
                    // initial stop condition:
                    if (position === "head" && this.headBlackTryCount >= this.MAX_TRIES) {
                        console.log("max retries exceeded for black detection in file", position);
                        // TODO add alert to DOM
                        this.headBlackStarted.emit(false);
                        return;
                    }
                    if (position === "tail" && this.tailBlackTryCount >= this.MAX_TRIES) {
                        console.log("max retries exceeded for black detection in file", position);
                        // TODO add alert to DOM
                        this.tailBlackStarted.emit(false);
                        return;
                    }
                    if (position === "head") {
                        this.headBlackStarted.emit(true);
                        sliceStart = (this.BLACK_CHUNK_SIZE * this.headBlackTryCount) +
                            this.headBlackTryCount;
                        sliceEnd = sliceStart + this.BLACK_CHUNK_SIZE;
                        console.log("head try count:", this.headBlackTryCount, "slice start:", sliceStart, "slice end:", sliceEnd);
                    }
                    if (position === "tail") {
                        this.tailBlackStarted.emit(true);
                        tailSliceEnd = mediaFile.size -
                            (this.BLACK_CHUNK_SIZE * this.tailBlackTryCount) - this.tailBlackTryCount;
                        tailSliceStart = tailSliceEnd - this.BLACK_CHUNK_SIZE;
                        // sliceEnd = sliceStart + BLACK_CHUNK_SIZE;
                        console.log("tail try count:", this.tailBlackTryCount, "tail slice start:", tailSliceStart, "tail slice end:", tailSliceEnd);
                    }
                    var fileToUse;
                    var sliceToUse;
                    if (position === "head") {
                        sliceToUse = mediaFile.slice(sliceStart, sliceEnd);
                        this.blackProgressHead = this.headBlackTryCount / this.MAX_TRIES;
                        ;
                        this.headProgress.emit(this.blackProgressHead);
                        fileToUse = this.headBlackFilename + "." + this.originalExtension;
                    }
                    if (position === "tail") {
                        sliceToUse = mediaFile.slice(tailSliceStart, tailSliceEnd);
                        console.log("tail try counter:", this.tailBlackTryCount);
                        this.blackProgressTail = this.tailBlackTryCount / this.MAX_TRIES;
                        this.tailProgress.emit(this.blackProgressTail);
                        fileToUse = this.tailBlackFilename + "." + this.originalExtension;
                    }
                    $.when(this.requestBlack(sliceToUse, position, fileToUse))
                        .then(function (data, textStatus, jqXHR) {
                        if (data.blackDetect[0]) {
                            var duration = parseFloat(data.blackDetect[0].duration);
                            console.log("this is my black duration, returned from requestBlack:");
                            console.log(duration);
                            // stop condition
                            if (duration >= _this.MIN_BLACK_TIME) {
                                console.log("the detected black duration of", duration, "is greater or equal to the min black time of", _this.MIN_BLACK_TIME);
                                console.log("so we can stop recursing");
                                // TODO set tail dom values
                                if (position === "head") {
                                    _this.headBlackStarted.emit(false);
                                    _this.headBlackResult.emit(data.blackDetect);
                                }
                                if (position === "tail") {
                                    _this.tailBlackStarted.emit(false);
                                    _this.tailBlackResult.emit(data.blackDetect);
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
                }; // recursiveBlackDetect
                DetectBlackService.prototype.requestBlack = function (slice, position, filename) {
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
                }; // requestBlack
                DetectBlackService = __decorate([
                    core_1.Injectable(), 
                    __metadata('design:paramtypes', [])
                ], DetectBlackService);
                return DetectBlackService;
            })();
            exports_1("DetectBlackService", DetectBlackService); // class
        }
    }
});
