System.register(['angular2/core', "../extract-metadata/extract-metadata.service", "../detect-black/detect-black.service", "../detect-mono/detect-mono.service"], function(exports_1) {
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, extract_metadata_service_1, detect_black_service_1, detect_mono_service_1;
    var ValidationsService;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (extract_metadata_service_1_1) {
                extract_metadata_service_1 = extract_metadata_service_1_1;
            },
            function (detect_black_service_1_1) {
                detect_black_service_1 = detect_black_service_1_1;
            },
            function (detect_mono_service_1_1) {
                detect_mono_service_1 = detect_mono_service_1_1;
            }],
        execute: function() {
            ValidationsService = (function () {
                // TODO: monoResults, blackResults, metadataResults
                function ValidationsService(extractMetadataService, detectBlackService, detectMonoService, config) {
                    this.validationStartedEmitter = new core_1.EventEmitter();
                    this.config = config || {
                        blackSeconds: 3,
                        monoPassingCount: 1 // minimum number of mono detection segments which are stereo
                    };
                    // todo, subscribe to each, fire validation functions when data available
                    // if any of them have started, set validationStartedEmitter = true
                }
                ValidationsService = __decorate([
                    core_1.Injectable(), 
                    __metadata('design:paramtypes', [extract_metadata_service_1.ExtractMetadataService, detect_black_service_1.DetectBlackService, detect_mono_service_1.DetectMonoService, Object])
                ], ValidationsService);
                return ValidationsService;
            })();
            exports_1("ValidationsService", ValidationsService);
        }
    }
});
