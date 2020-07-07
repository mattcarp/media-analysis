System.register(["angular2/core", "rxjs/Observable", "rxjs/add/observable/fromPromise", "rxjs/add/observable/forkJoin", "../handle-endpoints/endpoint.service"], function (exports_1, context_1) {
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
    var core_1, Observable_1, endpoint_service_1, AnalyzeAudioService;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (Observable_1_1) {
                Observable_1 = Observable_1_1;
            },
            function (_1) {
            },
            function (_2) {
            },
            function (endpoint_service_1_1) {
                endpoint_service_1 = endpoint_service_1_1;
            }
        ],
        execute: function () {
            AnalyzeAudioService = /** @class */ (function () {
                function AnalyzeAudioService(endpointService) {
                    this.signalAnalysis = [];
                    this.detectStartedEmitter = new core_1.EventEmitter();
                    this.resultsEmitter = new core_1.EventEmitter();
                    this.endpoint = endpointService.getEndpoint();
                }
                AnalyzeAudioService.prototype.detectMono = function (mediaFile, bitrate) {
                    var _this = this;
                    var result = [];
                    // this.results = [];
                    // if bitrate is undefined, assume 25mbps
                    var videoBitrate = bitrate || 25000000;
                    // video bitrate is a bit smaller than overall bitrate
                    // TODO adjust chunk size if file is very short
                    var MONO_CHUNK_SIZE = Math.floor((videoBitrate * 1.1) / 8);
                    console.log('mono chunk size', MONO_CHUNK_SIZE);
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
                    console.log('in detect mono, the source file is this long:', mediaFile.size);
                    console.log('and the front slice is this long:', frontSlice.size);
                    console.log('mono middle slice starts at', midSliceStart);
                    console.log('mono middle slice ends at', midSliceEnd);
                    console.log('which is based on the video bitrate of', videoBitrate);
                    var observeFront = Observable_1.Observable.fromPromise(this.requestMono(frontSlice, 'front'));
                    var observeMiddle = Observable_1.Observable.fromPromise(this.requestMono(midSlice, 'middle'));
                    var observeEnd = Observable_1.Observable.fromPromise(this.requestMono(endSlice, 'end'));
                    // let observeForkJoined = Observable.forkJoin(observeFront, observeMiddle, observeEnd);
                    // let observeFront = Observable.fromPromise(this.requestAsync(frontSlice, 'front'));
                    // let observeMiddle = Observable.fromPromise(this.requestAsync(midSlice, 'middle'));
                    // let observeEnd = Observable.fromPromise(this.requestAsync(endSlice, 'end'));
                    var observeJoined = Observable_1.Observable.forkJoin(observeFront, observeMiddle, observeEnd);
                    observeJoined.subscribe(function (data) {
                        console.log('mono subscribe result:');
                        console.log(data); // => [frontOb, middleObj, endObj]
                        _this.resultsEmitter.emit(data);
                    });
                    observeFront.subscribe(function (response) {
                        result[0] = response;
                    });
                    observeMiddle.subscribe(function (response) {
                        result[1] = response;
                    });
                    observeEnd.subscribe(function (response) {
                        result[2] = response;
                        // TODO we should execute serially to ensure that by the time we're at the end,
                        // all other segments are done -- is this now done via forkJoin?
                        _this.detectStartedEmitter.emit(false);
                        // this.resultsEmitter.emit(result);
                    });
                };
                AnalyzeAudioService.prototype.requestMono = function (slice, chunkPosition) {
                    var _this = this;
                    this.detectStartedEmitter.emit(true);
                    // this.signalAnalysis = [];
                    var promise = $.ajax({
                        type: 'POST',
                        url: this.endpoint + 'mono',
                        data: slice,
                        // don't massage binary to JSON
                        processData: false,
                        // content type that we are sending
                        contentType: 'application/octet-stream',
                        // add any custom headers
                        beforeSend: function (request) {
                            request.setRequestHeader('xa-chunk-position', chunkPosition);
                        },
                        error: function (err) {
                            console.log('error on the mono detection ajax request for chunk', chunkPosition);
                            console.log(err);
                        },
                        success: function (data) {
                            console.log('requestMono success function-data:', data);
                            _this.signalAnalysis.push(data);
                            console.log('requestMono: signal analysis length:', _this.signalAnalysis.length);
                        }
                    });
                    return promise;
                    // return Observable.fromPromise(promise);
                };
                AnalyzeAudioService = __decorate([
                    core_1.Injectable(),
                    __metadata("design:paramtypes", [endpoint_service_1.EndpointService])
                ], AnalyzeAudioService);
                return AnalyzeAudioService;
            }());
            exports_1("AnalyzeAudioService", AnalyzeAudioService);
        }
    };
});
//# sourceMappingURL=analyze-audio.service.js.map