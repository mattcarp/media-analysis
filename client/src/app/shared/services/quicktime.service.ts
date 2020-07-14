import {Injectable} from '@angular/core';

declare var jDataView: any;

// TODOmc correctly implement this interface
interface IMoovStats {
    moovExists: boolean;
    moovStart?: number;
    moovLength: number;
}

@Injectable({
  providedIn: 'root',
})
export class QuicktimeService {
  // given a small binary chunk, returns stats on the moov atom, if found
  getMoovStats(buf: ArrayBuffer): Object {
    let result: any = {};
    let chunkView = new jDataView(buf);
    let chunkString = chunkView.getString(chunkView.length, 0);
    let moovIndex = chunkString.indexOf('moov');
    if (moovIndex < 0) {
      result.moovExists = false;
      // short circuit
      return result;
    } else {
      result.moovExists = true;
    }
    // 4 bytes preceding 'moov' indicate the moov length
    let moovLocation: number = chunkString.indexOf('moov') - 4;
    chunkView.seek(moovLocation);
    let moovLength: number = chunkView.getUint32();
    result.moovStart = moovLocation;
    result.moovLength = moovLength;
    return result;
  }

  getMoov(moovStart: number, moovLength: number, buf: ArrayBuffer): ArrayBuffer {
    let moovBuf = buf.slice(moovStart, moovStart + moovLength);
    return moovBuf;
  }

  // TODO the returned object should match format of ffmpeg json
  parseMoov(moovBuf: ArrayBuffer): Object {
    let movRaw = new jDataView(moovBuf);
    let movString = movRaw.getString(movRaw.length, 0);
    // known moov subatoms: cmov (compressed movie),
    // dcom (data compression algorithm), cmvd (compressed movide data)
    let cmovPos = movString.indexOf('cmov');
    let dcomPos = movString.indexOf('dcom');
    let dmvdPos = movString.indexOf('cmvd');
    console.log('positions, everyone:', cmovPos, dcomPos, dmvdPos);

    console.log('this shold be a string containing only the moov data:');
    console.log(movString);

    return {bubbaGump: 'shrimp co'};
  }
}
