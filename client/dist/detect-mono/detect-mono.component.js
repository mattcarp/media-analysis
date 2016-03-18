System.register(['angular2/core', './detect-mono.service'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, detect_mono_service_1;
    var DetectMonoComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (detect_mono_service_1_1) {
                detect_mono_service_1 = detect_mono_service_1_1;
            }],
        execute: function() {
            DetectMonoComponent = (function () {
                function DetectMonoComponent(detectMonoService) {
                    var _this = this;
                    this.audioResults = [];
                    this.displayMonoDetails = [];
                    this.PEAK_THRESHOLD = -6;
                    detectMonoService.detectStartedEmitter.subscribe(function (value) {
                        if (value === true) {
                            console.log('mono detect has begun');
                        }
                        _this.audioResults = [];
                        _this.detectingMono = value;
                    });
                    detectMonoService.resultsEmitter.subscribe(function (detections) {
                        _this.detectingMono = false;
                        console.log('mono detection complete: the detection array:');
                        console.log(detections);
                        _this.detections = detections;
                        _this.validate(detections);
                    });
                } // constructor
                DetectMonoComponent.prototype.validate = function (detections) {
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
                    console.log('gonna hand this to the view:', detections);
                    // TODOmc results are intermittently ommitted from the view
                    this.audioResults = detections;
                };
                DetectMonoComponent.prototype.showMonoDetails = function (index) {
                    this.displayMonoDetails[index] = !this.displayMonoDetails[index];
                };
                DetectMonoComponent = __decorate([
                    core_1.Component({
                        selector: 'detect-mono',
                        templateUrl: 'src/detect-mono/detect-mono.html',
                    }), 
                    __metadata('design:paramtypes', [detect_mono_service_1.DetectMonoService])
                ], DetectMonoComponent);
                return DetectMonoComponent;
            }());
            exports_1("DetectMonoComponent", DetectMonoComponent); // class
        }
    }
});
