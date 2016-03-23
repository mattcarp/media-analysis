// import {EventEmitter, Injectable} from 'angular2/core';
//
// import {ExtractMetadataService} from "../extract-metadata/extract-metadata.service";
// import {DetectBlackService} from "../detect-black/detect-black.service";
// import {DetectMonoService} from "../analyze-audio/analyze-audio.service";
//
// @Injectable()
// export class ValidationsService {
//   config: Object;
//   validationStartedEmitter = new EventEmitter();
//
//   // TODO: monoResults, blackResults, metadataResults
//
//   constructor(extractMetadataService: ExtractMetadataService,
//     detectBlackService: DetectBlackService,
//     detectMonoService: DetectMonoService,
//     config: Object) {
//       this.config = config || {
//         blackSeconds: 3, // minimum black for head and tail
//         monoPassingCount: 1 // minimum number of mono detection segments which are stereo
//         // other stuff
//         // frameRate ?
//         // aspectRatio ?
//       }
//
//     // todo, subscribe to each, fire validation functions when data available
//     // if any of them have started, set validationStartedEmitter = true
//   }
//
// }
