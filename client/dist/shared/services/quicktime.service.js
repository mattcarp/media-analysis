System.register(["angular2/core"], function (exports_1, context_1) {
    "use strict";
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var core_1, QuicktimeService;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (core_1_1) {
                core_1 = core_1_1;
            }
        ],
        execute: function () {
            QuicktimeService = /** @class */ (function () {
                function QuicktimeService() {
                }
                // given a small binary chunk, returns stats on the moov atom, if found
                QuicktimeService.prototype.getMoovStats = function (buf) {
                    var result = {};
                    var chunkView = new jDataView(buf);
                    var chunkString = chunkView.getString(chunkView.length, 0);
                    var moovIndex = chunkString.indexOf('moov');
                    if (moovIndex < 0) {
                        result.moovExists = false;
                        // short circuit
                        return result;
                    }
                    else {
                        result.moovExists = true;
                    }
                    // 4 bytes preceding 'moov' indicate the moov length
                    var moovLocation = chunkString.indexOf('moov') - 4;
                    chunkView.seek(moovLocation);
                    var moovLength = chunkView.getUint32();
                    result.moovStart = moovLocation;
                    result.moovLength = moovLength;
                    return result;
                };
                QuicktimeService.prototype.getMoov = function (moovStart, moovLength, buf) {
                    var moovBuf = buf.slice(moovStart, moovStart + moovLength);
                    return moovBuf;
                };
                // TODO the returned object should match format of ffmpeg json
                QuicktimeService.prototype.parseMoov = function (moovBuf) {
                    var movRaw = new jDataView(moovBuf);
                    var movString = movRaw.getString(movRaw.length, 0);
                    // known moov subatoms: cmov (compressed movie),
                    // dcom (data compression algorithm), cmvd (compressed movide data)
                    var cmovPos = movString.indexOf('cmov');
                    var dcomPos = movString.indexOf('dcom');
                    var dmvdPos = movString.indexOf('cmvd');
                    console.log('positions, everyone:', cmovPos, dcomPos, dmvdPos);
                    console.log('this shold be a string containing only the moov data:');
                    console.log(movString);
                    return { bubbaGump: 'shrimp co' };
                };
                QuicktimeService = __decorate([
                    core_1.Injectable()
                ], QuicktimeService);
                return QuicktimeService;
            }());
            exports_1("QuicktimeService", QuicktimeService);
        }
    };
});
//# sourceMappingURL=quicktime.service.js.map