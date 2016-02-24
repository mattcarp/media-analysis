System.register(["angular2/core", "./detect-black.service"], function(exports_1) {
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, detect_black_service_1;
    var DetectBlackComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (detect_black_service_1_1) {
                detect_black_service_1 = detect_black_service_1_1;
            }],
        execute: function() {
            DetectBlackComponent = (function () {
                function DetectBlackComponent(detectBlackService) {
                    var _this = this;
                    detectBlackService.headBlackStarted.subscribe(function (value) {
                        _this.headBlackStarted = value;
                    });
                    detectBlackService.tailBlackStarted.subscribe(function (value) {
                        _this.tailBlackStarted = value;
                    });
                    detectBlackService.headProgress.subscribe(function (value) {
                        _this.headBlackProgress = value;
                    });
                    detectBlackService.tailProgress.subscribe(function (value) {
                        _this.tailBlackProgress = value;
                    });
                    detectBlackService.headBlackResult.subscribe(function (value) {
                        console.log("i am subscribing, and should not be undefined");
                        console.log(typeof value);
                        if (value) {
                            if (value.blackDetect) {
                                _this.headBlackResult = value.blackDetect;
                            }
                            else {
                                _this.headBlackResult = value;
                            }
                        }
                    });
                    detectBlackService.tailBlackResult.subscribe(function (value) {
                        _this.tailBlackResult = value;
                    });
                }
                DetectBlackComponent = __decorate([
                    core_1.Component({
                        selector: "detect-black",
                        templateUrl: "src/detect-black/detect-black.html",
                    }), 
                    __metadata('design:paramtypes', [detect_black_service_1.DetectBlackService])
                ], DetectBlackComponent);
                return DetectBlackComponent;
            })();
            exports_1("DetectBlackComponent", DetectBlackComponent);
        }
    }
});
