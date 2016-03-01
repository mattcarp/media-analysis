///<reference path="../node_modules/angular2/typings/browser.d.ts"/>
System.register(["angular2/core", "angular2/platform/browser", "angular2/router", "./handle-files/handle-files.component", "./detect-black/detect-black.component", "./extract-metadata/extract-metadata.component", "./detect-mono/detect-mono.component", "./validate-format/validate-format.component", "./player/player.component", "./upload-file/upload-file.component", "./detect-black/detect-black.service", "./handle-files/handle-files.service", "./extract-metadata/extract-metadata.service", "./detect-mono/detect-mono.service", "./handle-endpoints/endpoint.service"], function(exports_1, context_1) {
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
    var core_1, browser_1, router_1, handle_files_component_1, detect_black_component_1, extract_metadata_component_1, detect_mono_component_1, validate_format_component_1, player_component_1, upload_file_component_1, detect_black_service_1, handle_files_service_1, extract_metadata_service_1, detect_mono_service_1, endpoint_service_1;
    var AnalysisApp;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (browser_1_1) {
                browser_1 = browser_1_1;
            },
            function (router_1_1) {
                router_1 = router_1_1;
            },
            function (handle_files_component_1_1) {
                handle_files_component_1 = handle_files_component_1_1;
            },
            function (detect_black_component_1_1) {
                detect_black_component_1 = detect_black_component_1_1;
            },
            function (extract_metadata_component_1_1) {
                extract_metadata_component_1 = extract_metadata_component_1_1;
            },
            function (detect_mono_component_1_1) {
                detect_mono_component_1 = detect_mono_component_1_1;
            },
            function (validate_format_component_1_1) {
                validate_format_component_1 = validate_format_component_1_1;
            },
            function (player_component_1_1) {
                player_component_1 = player_component_1_1;
            },
            function (upload_file_component_1_1) {
                upload_file_component_1 = upload_file_component_1_1;
            },
            function (detect_black_service_1_1) {
                detect_black_service_1 = detect_black_service_1_1;
            },
            function (handle_files_service_1_1) {
                handle_files_service_1 = handle_files_service_1_1;
            },
            function (extract_metadata_service_1_1) {
                extract_metadata_service_1 = extract_metadata_service_1_1;
            },
            function (detect_mono_service_1_1) {
                detect_mono_service_1 = detect_mono_service_1_1;
            },
            function (endpoint_service_1_1) {
                endpoint_service_1 = endpoint_service_1_1;
            }],
        execute: function() {
            AnalysisApp = (function () {
                function AnalysisApp(extractMetadataService) {
                    // TODO subscribe to meta
                }
                AnalysisApp = __decorate([
                    core_1.Component({
                        selector: "analysis-app",
                        templateUrl: "src/main.html",
                        directives: [detect_black_component_1.DetectBlackComponent, handle_files_component_1.HandleFilesComponent,
                            extract_metadata_component_1.ExtractMetadataComponent, detect_mono_component_1.DetectMonoComponent,
                            validate_format_component_1.ValidateFormatComponent, player_component_1.PlayerComponent, upload_file_component_1.UploadFileComponent,
                            router_1.ROUTER_DIRECTIVES
                        ],
                        providers: [detect_black_service_1.DetectBlackService, handle_files_service_1.FileHandlerService,
                            extract_metadata_service_1.ExtractMetadataService, detect_mono_service_1.DetectMonoService, endpoint_service_1.EndpointService]
                    }),
                    router_1.RouteConfig([
                        // { path: "/", name: "root", redirectTo: ["Home"] },
                        { path: "/upload", name: "Upload", component: upload_file_component_1.UploadFileComponent },
                    ]), 
                    __metadata('design:paramtypes', [extract_metadata_service_1.ExtractMetadataService])
                ], AnalysisApp);
                return AnalysisApp;
            }());
            exports_1("AnalysisApp", AnalysisApp);
            browser_1.bootstrap(AnalysisApp, [router_1.ROUTER_PROVIDERS]);
        }
    }
});
