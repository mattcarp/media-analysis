import { Injectable } from '@angular/core';

declare var jDataView: any;

// TODOmc correctly implement this interface
export interface IMoovStats {
  moovExists: boolean;
  moovStart?: number;
  moovLength: number;
}

@Injectable({
  providedIn: 'root',
})
export class QuicktimeService {
  constructor() {}

  // given a small binary chunk, returns stats on the moov atom, if found
  getMoovStats(buf: ArrayBuffer): any {
    const result: any = {};
    const chunkView = new jDataView(buf);
    const chunkString = chunkView.getString(chunkView.length, 0);
    const moovIndex = chunkString.indexOf('moov');

    if (moovIndex < 0) {
      result.moovExists = false;
      // short circuit
      return result;
    } else {
      result.moovExists = true;
    }
    // 4 bytes preceding 'moov' indicate the moov length
    const moovLocation: number = chunkString.indexOf('moov') - 4;
    chunkView.seek(moovLocation);
    const moovLength: number = chunkView.getUint32();
    result.moovStart = moovLocation;
    result.moovLength = moovLength;
    return result;
  }

  getMoov(
    moovStart: number,
    moovLength: number,
    buf: ArrayBuffer,
  ): ArrayBuffer {
    return buf.slice(moovStart, moovStart + moovLength);
  }

  // TODO the returned object should match format of ffmpeg json
  parseMoov(moovBuf: ArrayBuffer): { bubbaGump: string } {
    const movRaw = new jDataView(moovBuf);
    const movString = movRaw.getString(movRaw.length, 0);
    // known moov subatoms: cmov (compressed movie),
    // dcom (data compression algorithm), cmvd (compressed movide data)
    const cmovPos = movString.indexOf('cmov');
    const dcomPos = movString.indexOf('dcom');
    const dmvdPos = movString.indexOf('cmvd');

    console.log(`%c Positions, everyone: ${cmovPos}, ${dcomPos}, ${dmvdPos}`,
      'color: green',
    );
    console.log(`%c This shold be a string containing only the moov data:`,
      'color: green',
    );
    console.log(movString);

    return { bubbaGump: 'shrimp co' };
  }
}
