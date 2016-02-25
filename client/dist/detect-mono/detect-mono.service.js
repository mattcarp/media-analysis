System.register(["angular2/core", "../handle-endpoints/endpoint.service"], function(exports_1) {
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, endpoint_service_1;
    var DetectMonoService;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (endpoint_service_1_1) {
                endpoint_service_1 = endpoint_service_1_1;
            }],
        execute: function() {
            DetectMonoService = (function () {
                function DetectMonoService(endpointService) {
                    this.audioAnalysis = [];
                    this.detectStartedEmitter = new core_1.EventEmitter();
                    this.resultsEmitter = new core_1.EventEmitter();
                    this.results = [];
                    this.endpoint = endpointService.getEndpoint();
                }
                DetectMonoService.prototype.detectMono = function (mediaFile, bitrate) {
                    var _this = this;
                    // if bitrate is undefined, assume 25mbps
                    var videoBitrate = bitrate || 25000000;
                    // video bitrate is a bit smaller than overall bitrate
                    // TODO adjust chunk size if file is very short
                    var MONO_CHUNK_SIZE = Math.floor((videoBitrate * 1.1) / 8);
                    console.log("mono chunk size", MONO_CHUNK_SIZE);
                    var length = mediaFile.size;
                    var frontSliceStart = Math.floor(length / 3);
                    var frontSliceEnd = frontSliceStart + MONO_CHUNK_SIZE;
                    var frontSlice = mediaFile.slice(frontSliceStart, frontSliceEnd);
                    var midSliceStart = Math.floor(length / 2) - (MONO_CHUNK_SIZE / 2);
                    var midSliceEnd = midSliceStart + MONO_CHUNK_SIZE;
                    var midSlice = mediaFile.slice(midSliceStart, midSliceEnd);
                    var endSliceStart = frontSliceStart * 2;
                    var endSliceEnd = endSliceStart + MONO_CHUNK_SIZE;
                    var endSlice = mediaFile.slice(endSliceStart, endSliceEnd);
                    console.log("in detect mono, the source file is this long:", mediaFile.size);
                    console.log("and the front slice is this long:", frontSlice.size);
                    console.log("mono middle slice starts at", midSliceStart);
                    console.log("mono middle slice ends at", midSliceEnd);
                    console.log("which is based on the video bitrate of", videoBitrate);
                    this.detectStartedEmitter.emit(false);
                    $.when(this.requestMono(frontSlice, "front"))
                        .then(function (data, textStatus, jqXHR) {
                        console.log("first mono detect call is complete:");
                        console.log(data);
                    })
                        .then(this.requestMono(midSlice, "middle"))
                        .then(function (data, textStatus, jqXHR) {
                        console.log("second (middle) mono detect call should be done:");
                        console.log(data);
                    })
                        .then(this.requestMono(endSlice, "end"))
                        .then(function (data, textStatus, jqXHR) {
                        console.log("final mono detect call should be done:");
                        console.log(data);
                    })
                        .then(function (finalResults) {
                        console.log("final mono detect call should be done:");
                        console.log(finalResults);
                        _this.detectStartedEmitter.emit(false);
                        _this.resultsEmitter.emit(_this.audioAnalysis);
                    });
                };
                DetectMonoService.prototype.requestMono = function (slice, chunkPosition) {
                    var _this = this;
                    this.detectStartedEmitter.emit(true);
                    var self = this;
                    var promise = $.ajax({
                        type: "POST",
                        url: this.endpoint + "mono",
                        data: slice,
                        // don't massage binary to JSON
                        processData: false,
                        // content type that we are sending
                        contentType: "application/octet-stream",
                        // add any custom headers
                        beforeSend: function (request) {
                            request.setRequestHeader("xa-chunk-position", chunkPosition);
                        },
                        error: function (err) {
                            console.log("error on the mono detection ajax request for chunk", chunkPosition);
                            console.log(err);
                        },
                        success: function (data) {
                            _this.audioAnalysis.push(data);
                            console.log("audio analysis array:");
                            console.dir(_this.audioAnalysis);
                        }
                    });
                    return promise;
                    // return Observable.fromPromise(promise);
                };
                DetectMonoService = __decorate([
                    core_1.Injectable(), 
                    __metadata('design:paramtypes', [endpoint_service_1.EndpointService])
                ], DetectMonoService);
                return DetectMonoService;
            })();
            exports_1("DetectMonoService", DetectMonoService);
        }
    }
});
