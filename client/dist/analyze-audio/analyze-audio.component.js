System.register(["angular2/core", "./analyze-audio.service"], function (exports_1, context_1) {
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
    var core_1, analyze_audio_service_1, AnalyzeAudioComponent;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (analyze_audio_service_1_1) {
                analyze_audio_service_1 = analyze_audio_service_1_1;
            }
        ],
        execute: function () {
            AnalyzeAudioComponent = /** @class */ (function () {
                function AnalyzeAudioComponent(analyzeAudioService) {
                    var _this = this;
                    this.audioResults = [];
                    this.displayMonoDetails = [];
                    this.PEAK_THRESHOLD = -6;
                    analyzeAudioService.detectStartedEmitter.subscribe(function (value) {
                        if (value === true) {
                            console.log('mono detect has begun');
                        }
                        _this.audioResults = [];
                        _this.detectingMono = value;
                    });
                    analyzeAudioService.resultsEmitter.subscribe(function (detections) {
                        _this.detectingMono = false;
                        console.log('mono detection complete: the detection array:');
                        console.log(detections);
                        _this.formatDetections(detections);
                        _this.detections = detections;
                        _this.validate(detections);
                    });
                } // constructor
                AnalyzeAudioComponent.prototype.formatDetections = function (detections) {
                    var _this = this;
                    var resultArr = [];
                    detections.map(function (analysis, index) {
                        // this.formatAudioData(analysis.data);
                        resultArr[index] = _this.formatAudioData(analysis.data);
                    });
                    this.segmentAnalyses = resultArr;
                };
                AnalyzeAudioComponent.prototype.formatAudioData = function (data) {
                    var result = [];
                    data.map(function (item, index) {
                        if (index === 0) {
                            result.push('           ' + item);
                        }
                        else {
                            result.push(item);
                        }
                    });
                    console.log('result of formatting the audio analysis:', result);
                    // this.segmtentAnalyses = result;
                    return result;
                };
                AnalyzeAudioComponent.prototype.validate = function (detections) {
                    if (detections.length > 2) {
                        if (detections[0].peakLevel > this.PEAK_THRESHOLD ||
                            detections[1].peakLevel > this.PEAK_THRESHOLD ||
                            detections[2].peakLevel > this.PEAK_THRESHOLD) {
                            this.peakThresholdExceeded = true;
                        }
                        if (detections[0].isMono && detections[1].isMono && detections[2].isMono) {
                            this.shouldWarnMono = true;
                        }
                    }
                    // TODOmc results are intermittently ommitted from the view
                    this.audioResults = detections;
                };
                AnalyzeAudioComponent.prototype.showMonoDetails = function (index) {
                    this.displayMonoDetails[index] = !this.displayMonoDetails[index];
                };
                AnalyzeAudioComponent = __decorate([
                    core_1.Component({
                        selector: 'detect-mono',
                        templateUrl: 'src/analyze-audio/analyze-audio.html',
                    }),
                    __metadata("design:paramtypes", [analyze_audio_service_1.AnalyzeAudioService])
                ], AnalyzeAudioComponent);
                return AnalyzeAudioComponent;
            }());
            exports_1("AnalyzeAudioComponent", AnalyzeAudioComponent);
        }
    };
});
//# sourceMappingURL=analyze-audio.component.js.map