System.register(["angular2/core", '../extract-metadata/extract-metadata.service', '../handle-files/handle-files.service'], function(exports_1) {
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, extract_metadata_service_1, handle_files_service_1;
    var PlayerComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (extract_metadata_service_1_1) {
                extract_metadata_service_1 = extract_metadata_service_1_1;
            },
            function (handle_files_service_1_1) {
                handle_files_service_1 = handle_files_service_1_1;
            }],
        execute: function() {
            // TODOmc inject the player service
            PlayerComponent = (function () {
                // playerService: any;
                function PlayerComponent(extractMetadataService, fileHandlerService) {
                    var _this = this;
                    this.showPlayer = false;
                    this.showPlayerHeader = false;
                    this.playerInstance = jwplayer("player-dark");
                    this.dummyPlaylist = [{ "file": "http://www.tonycuffe.com/mp3/cairnomount.mp3", "title": "the first track" }, { "file": "http://www.tonycuffe.com/mp3/tail%20toddle.mp3", "title": "the second track" }, { "file": "full url, man", "title": "the third track" }, { "file": "full url, man", "title": "the fourth track" }, { "file": "full url, man", "title": "the fifth track" }, { "file": "full url, man", "title": "the sixth track" }, { "file": "full url, man", "title": "the seventh track" }, { "file": "full url, man", "title": "the eigth track" }, { "file": "full url, man", "title": "the ninth track" }, { "file": "http://www.tonycuffe.com/mp3/cairnomount.mp3", "title": "side two! the first track" }, { "file": "http://www.tonycuffe.com/mp3/tail%20toddle.mp3", "title": "the second track" }, { "file": "full url, man", "title": "the third track" }, { "file": "full url, man", "title": "the fourth track" }, { "file": "full url, man", "title": "the fifth track" }, { "file": "full url, man", "title": "the sixth track" }, { "file": "full url, man", "title": "the seventh track" }, { "file": "full url, man", "title": "the eigth track" }, { "file": "full url, man", "title": "the ninth track" }];
                    console.log("player instance");
                    console.log(this.playerInstance);
                    this.metadataResult = extractMetadataService.metadataResult;
                    this.metadataResult.subscribe(function (value) {
                        // this.renderResult(value);
                        // this.initPlayer(this.dummyPlaylist);
                        _this.showPlayerHeader = true;
                    });
                }
                PlayerComponent.prototype.playVideo = function (track) {
                };
                PlayerComponent.prototype.initPlayer = function (playlist) {
                    // TODO if we have no audio tracks, don't load player
                    console.log("player was instantiated");
                    this.playerInstance.setup({
                        playlist: playlist,
                        width: "100%",
                        height: 40,
                        skin: {
                            name: "aoma"
                        }
                    });
                };
                PlayerComponent.prototype.togglePlayer = function () {
                    this.showPlayer = !this.showPlayer;
                };
                PlayerComponent = __decorate([
                    core_1.Component({
                        selector: "player",
                        templateUrl: "src/player/player.html"
                    }), 
                    __metadata('design:paramtypes', [extract_metadata_service_1.ExtractMetadataService, handle_files_service_1.FileHandlerService])
                ], PlayerComponent);
                return PlayerComponent;
            })();
            exports_1("PlayerComponent", PlayerComponent);
        }
    }
});
