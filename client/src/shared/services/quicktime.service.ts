import {Injectable} from 'angular2/core';

declare var jDataView: any;

@Injectable()
export class QuicktimeService {

  // constructor() {}

  // given a small binary chunk, returns stats on the moov atom, if found
  getMoovStats(buffer: ArrayBuffer): Object {
    let result = {};
    let int32View = new Int32Array(buffer);

    // new jDataView(buffer, 0, 150000, littleEndian = false);
    var view = new jDataView(int32View);

    console.log('from the qt service, you got this for the blob:', view);
    return result;
  }
}
