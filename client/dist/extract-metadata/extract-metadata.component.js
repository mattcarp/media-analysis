System.register(["angular2/core", "./extract-metadata.service"], function (exports_1, context_1) {
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
    var core_1, extract_metadata_service_1, ExtractMetadataComponent;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (extract_metadata_service_1_1) {
                extract_metadata_service_1 = extract_metadata_service_1_1;
            }
        ],
        execute: function () {
            ExtractMetadataComponent = /** @class */ (function () {
                function ExtractMetadataComponent(extractMetadataService) {
                    var _this = this;
                    this.showFormat = false;
                    this.showMetadata = false;
                    // clear state - TODO use a redux store for this
                    this.metadataResult = null;
                    this.metadataLoading = false;
                    this.metadataStarted = extractMetadataService.metadataStarted;
                    this.metadataStarted.subscribe(function (value) {
                        if (value === true) {
                            console.log("metadata extraction started");
                        }
                        _this.metadataLoading = value;
                    });
                    this.metadataResult = extractMetadataService.metadataResult;
                    this.metadataResult.subscribe(function (value) {
                        _this.renderResult(value);
                    });
                }
                ExtractMetadataComponent.prototype.renderResult = function (data) {
                    var _this = this;
                    if (data.error) {
                        this.ffprobeErr = data.error;
                    }
                    var analysisObj = JSON.parse(data.analysis);
                    console.log("analysis object, and number of keys:");
                    console.log(analysisObj);
                    console.log(Object.keys(analysisObj).length);
                    if (analysisObj && Object.keys(analysisObj).length !== 0) {
                        var formatObj = analysisObj.format;
                        // zone.run(() => { this.showFormat = true});
                        this.showFormat = true;
                        this.format = this.processObject(formatObj);
                        console.log("format object, from which we can filter extraneous keys:");
                        console.log(this.format);
                        if (formatObj.tags && Object.keys(formatObj.tags).length !== 0) {
                            this.formatTags = this.processObject(formatObj.tags);
                        }
                    }
                    if (analysisObj.streams && Object.keys(analysisObj.streams).length !== 0) {
                        var collectedStreams_1 = [];
                        var inputStreams = analysisObj.streams;
                        inputStreams.forEach(function (currentStream) {
                            console.log("i am a stream");
                            collectedStreams_1.push(_this.processObject(currentStream));
                        });
                        this.streams = collectedStreams_1;
                        // show the panel
                        this.metadata = true;
                    }
                };
                // takes an object, removes any keys with array values, and returns
                // an array of objects: {key: value}
                // this is handy for ffprobe's format and tags objects
                ExtractMetadataComponent.prototype.processObject = function (formatObj) {
                    var keysArr = Object.keys(formatObj);
                    return keysArr
                        // TODO filter if value for key is object or array, rather than not 'tags'
                        .filter(function (formatKey) { return formatKey !== "tags"; })
                        .map(function (formatKey) {
                        var item = {};
                        // replace underscores and format with initial caps
                        item.key = formatKey.replace(/_/g, " ")
                            .replace(/(?:^|\s)[a-z]/g, function (m) {
                            return m.toUpperCase();
                        }).replace("Nb ", "Number of ");
                        ;
                        item.value = formatObj[formatKey];
                        return item;
                    });
                };
                ExtractMetadataComponent.prototype.toggleMetadata = function () {
                    this.showMetadata = !this.showMetadata;
                };
                ExtractMetadataComponent = __decorate([
                    core_1.Component({
                        selector: 'extract-metadata',
                        templateUrl: 'src/extract-metadata/extract-metadata.html',
                    }),
                    __metadata("design:paramtypes", [extract_metadata_service_1.ExtractMetadataService])
                ], ExtractMetadataComponent);
                return ExtractMetadataComponent;
            }());
            exports_1("ExtractMetadataComponent", ExtractMetadataComponent);
        }
    };
});
//# sourceMappingURL=extract-metadata.component.js.map