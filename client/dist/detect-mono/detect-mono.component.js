System.register(["angular2/core", "./detect-mono.service"], function(exports_1) {
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
                            console.log("mono detect has begun");
                        }
                        _this.audioResults = [];
                        _this.detectingMono = value;
                    });
                    detectMonoService.resultsEmitter.subscribe(function (detections) {
                        _this.detectingMono = false;
                        console.log("detect mono component constructor: the detection array:");
                        console.log(detections);
                        _this.validate(detections);
                    });
                } // constructor
                DetectMonoComponent.prototype.validate = function (detections) {
                    // clear the state - TODO this doesn't work - use redux pattern
                    // this.audioResults = [];
                    console.log("these are my new detections, welcome!", detections);
                    if (detections.length > 2) {
                        if (detections.front.peakLevel > this.PEAK_THRESHOLD ||
                            detections.middle.peakLevel > this.PEAK_THRESHOLD ||
                            detections.end.peakLevel > this.PEAK_THRESHOLD) {
                            this.peakThresholdExceeded = true;
                        }
                        if (detections.front.isMono && detections.middle.isMono && detections.end.isMono) {
                            this.shouldWarnMono = true;
                        }
                    }
                    console.log("gonna hand this to the view:", detections);
                    // convert object to array so we can iterate in the view
                    var resultArr = Object.keys(detections).map(function (key) { return detections[key]; });
                    console.log("audio results as an array", resultArr);
                    this.audioResults = resultArr;
                };
                DetectMonoComponent.prototype.showMonoDetails = function (index) {
                    this.displayMonoDetails[index] = !this.displayMonoDetails[index];
                };
                DetectMonoComponent = __decorate([
                    core_1.Component({
                        selector: "detect-mono",
                        templateUrl: "src/detect-mono/detect-mono.html",
                    }), 
                    __metadata('design:paramtypes', [detect_mono_service_1.DetectMonoService])
                ], DetectMonoComponent);
                return DetectMonoComponent;
            })();
            exports_1("DetectMonoComponent", DetectMonoComponent); // class
        }
    }
});
