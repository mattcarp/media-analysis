System.register(['angular2/core'], function(exports_1, context_1) {
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
    var core_1;
    var QuicktimeService;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            }],
        execute: function() {
            QuicktimeService = (function () {
                function QuicktimeService() {
                }
                // constructor() {}
                // given a small binary chunk, returns stats on the moov atom, if found
                QuicktimeService.prototype.getMoovStats = function (buffer) {
                    var result = {};
                    var int32View = new Int32Array(buffer);
                    // new jDataView(buffer, 0, 150000, littleEndian = false);
                    var view = new jDataView(int32View);
                    console.log('from the qt service, you got this for the blob:', view);
                    return result;
                };
                QuicktimeService = __decorate([
                    core_1.Injectable(), 
                    __metadata('design:paramtypes', [])
                ], QuicktimeService);
                return QuicktimeService;
            }());
            exports_1("QuicktimeService", QuicktimeService);
        }
    }
});
