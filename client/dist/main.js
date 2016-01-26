System.register(["angular2/core", "angular2/platform/browser", "rxjs/add/operator/map", "rxjs/add/operator/retry"], function(exports_1) {
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, browser_1;
    var SLICE_SIZE, BLACK_SIZE, AnalysisApp;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (browser_1_1) {
                browser_1 = browser_1_1;
            },
            function (_1) {},
            function (_2) {}],
        execute: function() {
            SLICE_SIZE = 100000;
            BLACK_SIZE = 5000000;
            AnalysisApp = (function () {
                function AnalysisApp() {
                    this.endpoint = this.setEndpoint();
                }
                AnalysisApp.prototype.readBlob = function (target) {
                    var _this = this;
                    var self = this;
                    var files = target.files;
                    var file = files[0];
                    var reader = new FileReader();
                    reader.onloadend = function (evt) {
                        if (evt.target.readyState == FileReader.DONE) {
                            $.ajax({
                                type: "POST",
                                url: _this.endpoint + "analysis",
                                data: blob,
                                processData: false,
                                contentType: 'application/octet-stream',
                                error: function (err) {
                                    console.log("you have an error on the ajax requst:");
                                    console.log(err);
                                },
                                success: function (data) {
                                    console.log("this is what i got from ffprobe:");
                                    console.log(data);
                                    self.renderResult(data);
                                    self.detectBlack();
                                    self.detectMono();
                                }
                            });
                        }
                    };
                    var blob = file.slice(0, SLICE_SIZE);
                    reader.readAsBinaryString(blob);
                };
                AnalysisApp.prototype.changeListener = function ($event) {
                    this.readBlob($event.target);
                };
                AnalysisApp.prototype.detectBlack = function () {
                    var stub = "";
                    console.log("hiya from black detection");
                    $.ajax({
                        type: "POST",
                        url: this.endpoint + "black",
                        data: stub,
                        processData: false,
                        contentType: 'application/octet-stream',
                        error: function (err) {
                            console.log("you have an error on the black detection ajax request:");
                            console.log(err);
                        },
                        success: function (data) {
                            console.log("this is what i got from ffprobe:");
                            console.log(data);
                            console.log("i'm inside the black detection ajax success method");
                        }
                    });
                };
                AnalysisApp.prototype.detectMono = function () {
                    console.log("hiya from dual mono detection");
                };
                AnalysisApp.prototype.renderResult = function (data) {
                    var _this = this;
                    if (data.error) {
                        this.ffprobeErr = data.error;
                    }
                    console.log("these are my top-level keys");
                    console.log(Object.keys(data));
                    var analysisObj = JSON.parse(data.analysis);
                    console.log("analysis object, and length:");
                    console.log(analysisObj);
                    console.log(Object.keys(analysisObj).length);
                    if (analysisObj && Object.keys(analysisObj).length !== 0) {
                        var formatObj = analysisObj.format;
                        this.format = this.processObject(formatObj);
                        console.log(formatObj);
                        if (formatObj.tags && Object.keys(formatObj.tags).length !== 0) {
                            this.formatTags = this.processObject(formatObj.tags);
                        }
                    }
                    if (analysisObj.streams && Object.keys(analysisObj.streams).length !== 0) {
                        var collectedStreams = [];
                        var inputStreams = analysisObj.streams;
                        inputStreams.forEach(function (currentStream) {
                            console.log("i am stream");
                            collectedStreams.push(_this.processObject(currentStream));
                        });
                        this.streams = collectedStreams;
                    }
                };
                AnalysisApp.prototype.processObject = function (formatObj) {
                    var keysArr = Object.keys(formatObj);
                    return keysArr
                        .filter(function (formatKey) { return formatKey !== "tags"; })
                        .map(function (formatKey) {
                        var item = {};
                        item.key = formatKey;
                        item.value = formatObj[formatKey];
                        return item;
                    });
                };
                AnalysisApp.prototype.setEndpoint = function () {
                    console.log("location hostname:", window.location.hostname);
                    if (window.location.hostname === "localhost") {
                        return "http://localhost:3000/";
                    }
                    else {
                        return "http://52.0.119.124:3000/";
                    }
                };
                AnalysisApp.prototype.logError = function (err) {
                    console.log("There was an error: ");
                    console.log(err);
                };
                AnalysisApp = __decorate([
                    core_1.Component({
                        selector: "analysis-app",
                        templateUrl: "src/main.html"
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
