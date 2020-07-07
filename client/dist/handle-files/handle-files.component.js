System.register(["angular2/core", "./handle-files.service", "../extract-metadata/extract-metadata.service", "../detect-black/detect-black.service", "../analyze-audio/analyze-audio.service"], function (exports_1, context_1) {
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
    var core_1, handle_files_service_1, extract_metadata_service_1, detect_black_service_1, analyze_audio_service_1, HandleFilesComponent;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (handle_files_service_1_1) {
                handle_files_service_1 = handle_files_service_1_1;
            },
            function (extract_metadata_service_1_1) {
                extract_metadata_service_1 = extract_metadata_service_1_1;
            },
            function (detect_black_service_1_1) {
                detect_black_service_1 = detect_black_service_1_1;
            },
            function (analyze_audio_service_1_1) {
                analyze_audio_service_1 = analyze_audio_service_1_1;
            }
        ],
        execute: function () {
            HandleFilesComponent = /** @class */ (function () {
                function HandleFilesComponent(eltRef, fileHandlerService, extractMetadataService, detectBlackService, detectMonoService) {
                    var _this = this;
                    new Dropzone(eltRef.nativeElement, {
                        url: "/file/post",
                        previewTemplate: "\n      <div class=\"dz-preview dz-file-preview ma-file__dz--hidden\">\n        <div class=\"dz-details\">\n          <div class=\"dz-filename\"><h5>file name: <span data-dz-name></span></h5></div>\n          <h5>size: <span data-dz-size></span></h5>\n        </div>\n      </div>\n      "
                    }).on("addedfile", function (file) {
                        _this.filename = file.name;
                        _this.fileSize = _this.bytesToSize(file.size);
                        fileHandlerService.setMediaFile(file);
                        extractMetadataService.extract(file);
                        extractMetadataService.metadataResult.subscribe(function (metadata) {
                            // const analysisObj = JSON.parse(metadata.analysis);
                            // TODO only if video, detect black and detect mono
                            detectBlackService.recursiveBlackDetect(file, "head");
                            detectBlackService.recursiveBlackDetect(file, "tail");
                            // attempt to clear previous state - TODO not working
                            // detectMonoService.results = [];
                            // detectMonoService.signalAnalysis = [];
                            // TODO pass bitrate from analysisObj to detectMono as second param
                            detectMonoService.detectMono(file);
                        });
                    });
                } // constructor
                HandleFilesComponent.prototype.bytesToSize = function (bytes) {
                    var sizes = ["Bytes", "KB", "MB", "GB", "TB"];
                    if (bytes === 0)
                        return "0 Byte";
                    var i = Math.floor(Math.log(bytes) / Math.log(1024));
                    return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
                };
                ;
                HandleFilesComponent = __decorate([
                    core_1.Component({
                        selector: "handle-files",
                        templateUrl: "src/handle-files/handle-files.html"
                    }),
                    __metadata("design:paramtypes", [core_1.ElementRef, handle_files_service_1.FileHandlerService,
                        extract_metadata_service_1.ExtractMetadataService,
                        detect_black_service_1.DetectBlackService,
                        analyze_audio_service_1.AnalyzeAudioService])
                ], HandleFilesComponent);
                return HandleFilesComponent;
            }());
            exports_1("HandleFilesComponent", HandleFilesComponent);
        }
    };
});
//# sourceMappingURL=handle-files.component.js.map