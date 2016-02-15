///<reference path="../node_modules/angular2/typings/browser.d.ts"/>
System.register(["angular2/core", "angular2/platform/browser", './detect-black/detect-black.component', './detect-black/detect-black.service', './handle-files/handle-files.component', './extract-metadata/extract-metadata.component', "./handle-files/handle-files.service", "./extract-metadata/extract-metadata.service", "./detect-mono/detect-mono.service"], function(exports_1) {
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, browser_1, detect_black_component_1, detect_black_service_1, handle_files_component_1, extract_metadata_component_1, handle_files_service_1, extract_metadata_service_1, detect_mono_service_1;
    var SLICE_SIZE, BLACK_CHUNK_SIZE, MIN_BLACK_TIME, AnalysisApp;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (browser_1_1) {
                browser_1 = browser_1_1;
            },
            function (detect_black_component_1_1) {
                detect_black_component_1 = detect_black_component_1_1;
            },
            function (detect_black_service_1_1) {
                detect_black_service_1 = detect_black_service_1_1;
            },
            function (handle_files_component_1_1) {
                handle_files_component_1 = handle_files_component_1_1;
            },
            function (extract_metadata_component_1_1) {
                extract_metadata_component_1 = extract_metadata_component_1_1;
            },
            function (handle_files_service_1_1) {
                handle_files_service_1 = handle_files_service_1_1;
            },
            function (extract_metadata_service_1_1) {
                extract_metadata_service_1 = extract_metadata_service_1_1;
            },
            function (detect_mono_service_1_1) {
                detect_mono_service_1 = detect_mono_service_1_1;
            }],
        execute: function() {
            // initial slice for metadata analysis
            SLICE_SIZE = 150000;
            // bit rates from ffmpeg are unreliable, so we have to take a fixed chunk
            BLACK_CHUNK_SIZE = 10000000;
            // minimum time, in seconds, for black at head and tail
            MIN_BLACK_TIME = 4;
            AnalysisApp = (function () {
                function AnalysisApp() {
                }
                AnalysisApp = __decorate([
                    core_1.Component({
                        selector: "analysis-app",
                        templateUrl: "src/main.html",
                        directives: [detect_black_component_1.DetectBlackComponent, handle_files_component_1.HandleFilesComponent,
                            extract_metadata_component_1.ExtractMetadataComponent],
                        providers: [detect_black_service_1.DetectBlackService, handle_files_service_1.FileHandlerService,
                            extract_metadata_service_1.ExtractMetadataService, detect_mono_service_1.DetectMonoService]
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
