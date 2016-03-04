import {Injectable} from 'angular2/core';

declare var jDataView: any;

// TODOmc correctly implement this interface
interface IMoovStats {
    moovExists: boolean;
    moovStart?: number;
    moovLength: number;
}

@Injectable()
export class QuicktimeService {
  // given a small binary chunk, returns stats on the moov atom, if found
  getMoovStats(buf: ArrayBuffer): Object {
    let result: any = {};
    let chunkView = new jDataView(buf);
    let chunkString = chunkView.getString(chunkView.length, 0);
    // 4 bytes preceding 'moov' indicate the moov length
    let moovIndex = chunkString.indexOf('moov');
    if (moovIndex < 0) {
      result.moovExists = false;
      // short circuit
      return result;
    } else {
      result.moovExists = true;
    }
    let moovLocation: number = chunkString.indexOf('moov') - 4;
    chunkView.seek(moovLocation);
    let moovLength: number = chunkView.getUint32();
    console.log('start of moov including length:', moovLocation);
    console.log('length of moov:', moovLength);

    result.moovStart = moovLocation;
    result.moovLength = moovLength;
    console.log('getMoovStats result object:');
    console.dir(result);
    return result;
  }

  // getMoov(moovStart: number, moovLength: number) {
  //
  // }
}
