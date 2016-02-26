System.register(["angular2/core", "angular2/router", "../extract-metadata/extract-metadata.service", "../handle-files/handle-files.service"], function(exports_1) {
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, router_1, extract_metadata_service_1, handle_files_service_1;
    var UploadFileComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (router_1_1) {
                router_1 = router_1_1;
            },
            function (extract_metadata_service_1_1) {
                extract_metadata_service_1 = extract_metadata_service_1_1;
            },
            function (handle_files_service_1_1) {
                handle_files_service_1 = handle_files_service_1_1;
            }],
        execute: function() {
            UploadFileComponent = (function () {
                function UploadFileComponent(extractMetadataService, fileHandlerService) {
                    var _this = this;
                    this.showUploadButton = false;
                    this.enableUpload = false;
                    this.fileHandlerService = fileHandlerService;
                    this.metadataResult = extractMetadataService.metadataResult;
                    this.metadataResult.subscribe(function (value) {
                        _this.showUploadButton = true;
                    });
                }
                UploadFileComponent.prototype.startUpload = function () {
                    var mediaFile = this.fileHandlerService.getMediaFile();
                    this.openRequestedPopup(mediaFile);
                };
                UploadFileComponent.prototype.openRequestedPopup = function (mediaFile) {
                    var windowObjectReference;
                    console.log("open popup: you requested this file:");
                    console.log(mediaFile);
                    windowObjectReference = window.open("http://blank.org", "DescriptiveWindowName", "width=420,height=230,resizable,scrollbars=yes,status=0,toolbar=0,menubar=0,location=0");
                    windowObjectReference.foo = "heeeyyyyy";
                    windowObjectReference.theFile = mediaFile;
                    // let mediaFile = this.fileHandlerService.getMediaFile();
                    // windowObjectReference.locationbar.visible = false;
                };
                UploadFileComponent.prototype.toggleUploadButton = function () {
                    this.enableUpload = !this.enableUpload;
                };
                UploadFileComponent = __decorate([
                    core_1.Component({
                        selector: "upload-file",
                        templateUrl: "src/upload-file/upload-file.html",
                        directives: [router_1.RouterLink]
                    }), 
                    __metadata('design:paramtypes', [extract_metadata_service_1.ExtractMetadataService, handle_files_service_1.FileHandlerService])
                ], UploadFileComponent);
                return UploadFileComponent;
            })();
            exports_1("UploadFileComponent", UploadFileComponent);
        }
    }
});
