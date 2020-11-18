import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { NGXLogger } from 'ngx-logger';

import { DdpState } from '../reducers/ddp.reducer';
import { setParsedCdText, setParsedPackItems } from '../actions/ddp.actions';

@Injectable({
  providedIn: 'root',
})
export class CdTextService {
  parsedPacks: any[] = []; // raw packs, with 12-character payloads
  parsedCdText: any[] = []; // after parsing raw packs, assemble payload to their true length
  assembledEntries: any[] = [];
  PACK_LENGTH = 18;
  PACK_TYPES = {
    '80': 'title',
    '81': 'performers',
    '82': 'songwriters',
    '83': 'composers',
    '84': 'arrangers',
    '85': 'messageArea',
    '86': 'discId', // in text and binary
    '87': 'genreId', // in text and binary
    '88': 'toc', // in binary
    '89': 'secondTOC', // in binary
    '8d': 'closedInfo',
    '8e': 'upcOrIsrc', // UPC of the album and ISRC code of each track
    '8f': 'blockSize' // 'information' (binary)
  };

  constructor(private store: Store<DdpState>, private logger: NGXLogger) {}

  parseCdText(cdTextBin: ArrayBuffer) {
    const numPacks = Math.floor(cdTextBin.byteLength / this.PACK_LENGTH);
    this.logger.log('number of packs in cd text file:', numPacks);
    for (let i = 0; i < numPacks; i++) {
      const param = cdTextBin.slice(i * this.PACK_LENGTH, (i + 1) * this.PACK_LENGTH);
      const parsedPack = this.parsePack(param);
      this.parsedPacks.push(parsedPack);
    }

    this.store.dispatch(setParsedCdText({ parsedCdText: this.parsedPacks }));
    const fullPayload: string = this.combinePayloads(this.parsedPacks);
    this.parsedCdText = this.parseFullPayload(fullPayload, this.parsedPacks);
    this.assemblePacks(this.parsedPacks);
  }

  parseFullPayload(payload: string, parsedPacks: any[]): any[] {
    const results: any[] = [];
    const PAYLOAD_LENGTH = 12;
    let trackChanged: boolean;
    let slicePoint: number;
    let payloadStr = payload;

    this.logger.log('the whole deal:', payloadStr);
    for (let i = 0; i < parsedPacks.length; i++) {
      trackChanged = i > 0 && parsedPacks[i].packTrackNo !== parsedPacks[i - 1].packTrackNo;
      if (trackChanged) {
        const entry: any = {};
        this.logger.log('the track has changed. i am currently looking at this pack:',
          parsedPacks[i].payload);
        if (parsedPacks[i - 1].charPos === 15) {
          // take the whole prior payload
          slicePoint = PAYLOAD_LENGTH;
          slicePoint += parsedPacks[i - 2].charPos;
          slicePoint += (PAYLOAD_LENGTH - parsedPacks[i + 1].charPos);
        }
        if (parsedPacks[i - 1].charPos !== 15) {
          slicePoint = parsedPacks[i - 1].charPos;
          this.logger.log('my arithmetic:', PAYLOAD_LENGTH - parsedPacks[i].charPos);
          slicePoint += (PAYLOAD_LENGTH - parsedPacks[i].charPos);
        }
        const currentContent: string = payloadStr.slice(0, slicePoint);
        payloadStr = payloadStr.slice(slicePoint);
        this.logger.log('gonna give you this:', currentContent);
        this.logger.log('which leaves me with this:', payloadStr);
        entry.content = currentContent;
        entry.trackNo = parsedPacks[i].packTrackNo;
        entry.type = parsedPacks[i].packType;
        results.push(entry);
      }
    }
    this.logger.log('gonna return this bastard', results);
    return results;
  }

  combinePayloads(parsedPacks: any[]): string {
    let result = '';
    for (const parsedPack of parsedPacks) {
      result += parsedPack.payload;
    }
    return result;
  }

  assemblePacks(parsedPacks: any[]) {
    let trackChanged: boolean;
    let priorCharPos: number;
    let nextCharPos: number;
    for (let i = 0; i < parsedPacks.length; i++) {
      i > 0 ? priorCharPos = parsedPacks[i - 1].charPos : priorCharPos = -1;
      const currCharPos = parsedPacks[i].charPos;
      i < (parsedPacks.length - 1) ? nextCharPos = parsedPacks[i + 1].charPos : nextCharPos = -1;
      // this.logger.log('prior, current, and next charPos', priorCharPos, currCharPos, nextCharPos);
      if (i > 0 && parsedPacks[i].packTrackNo !== parsedPacks[i - 1].packTrackNo) {
        trackChanged = true;
        this.logger.log(`track changed to ${parsedPacks[i].packTrackNo}.
          time to write the payload for the prior track`);
        this.writePriorPayload(i, parsedPacks);
      } else {
        trackChanged = false;
      }
      if (currCharPos === 15) {
        this.logger.log(`need to get the entire previous pack, and if prev pack's charpos is > 0,
          will need to go back more`);
      }
    }
    this.store.dispatch(setParsedPackItems({ parsedPackItems: this.assembledEntries }));
    this.logger.log('called next on assembled with this', this.assembledEntries);
  }

  writePriorPayload(currentPos: number, parsedPacks: Array<any>) {
    // at this point, the track number has changed, so we're ready to write the payload
    const PAYLOAD_LENGTH = 12;
    const entry: any = {};
    let assembledPayload: string;
    const prevPack = parsedPacks[currentPos - 1];
    const currPack = parsedPacks[currentPos];
    const nextPack = parsedPacks[currentPos + 1];

    if (prevPack.charPos === 0 && nextPack) {
      this.logger.log('charPos on previous pack is 0, so we should write the payload');
      this.logger.log('we are about to crash. nextPack is', nextPack);
      assembledPayload = currPack.payload.slice(0, PAYLOAD_LENGTH - nextPack.charPos);
    }
    if (prevPack.charPos > 0 && prevPack.charPos < 15) {
      this.logger.log('should i be slicing this payload to get to *give me a reason?',
        parsedPacks[currentPos - 2].payload);
      assembledPayload = parsedPacks[currentPos - 2].payload.
        slice(PAYLOAD_LENGTH - prevPack.charPos);
      assembledPayload += prevPack.payload.slice(0,
        (PAYLOAD_LENGTH - currPack.charPos));
      this.logger.log('how about this for a start?', assembledPayload);
    }
    if (prevPack.charPos === 15 ) {
      if (parsedPacks[currentPos - 2].charPos > 0) {
        assembledPayload =
          parsedPacks[currentPos - 3].payload.substr(
            parsedPacks[currentPos - 3].payload.length -
            parsedPacks[currentPos - 2].charPos) +
          parsedPacks[currentPos - 2].payload +
          prevPack.payload.slice(0, (prevPack.payload.length - currPack.charPos));
        this.logger.log(`handling a case where there's a 15 charPos preceded by a 12:`,
          assembledPayload);
      }
    }
    entry.trackNo = prevPack.packTrackNo;
    entry.type = prevPack.packType;
    entry.text = assembledPayload;
    this.assembledEntries.push(entry);
  }

  parsePack(pack: ArrayBuffer) {
    const parsedPack: any = {};
    const packView = new DataView(pack, 0);
    const typeCode = packView.getUint8(0).toString(16);
    parsedPack.packType = this.PACK_TYPES[typeCode];
    // this.logger.log('pack type?', parsedPack.packType);
    parsedPack.packTrackNo = packView.getUint8(1); // .toString(16);
    // this.logger.log('track number for this pack:', parsedPack.packTrackNo);
    const counterBin = packView.getUint8(2);
    parsedPack.counter = counterBin;
    // charPos is first 4 BITS of fourth byte
    const charPosByte = packView.getUint8(3);
    this.byteToArray(charPosByte).slice(4, 4).join('');


    // on the right track:
    parsedPack.charPos = charPosByte;
    // this.logger.log('char pos', parsedPack.charPos);
    const payloadBin = packView.buffer.slice(4, 16);
    parsedPack.payload = String.fromCharCode.apply(null, new Uint8Array(payloadBin));
    parsedPack.crc = packView.getUint16(16);
    // this.logger.log('payload:', parsedPack.payload);
    // this.logger.log('the parsed pack object:', parsedPack);
    return parsedPack;
  }

  getFile(cdTextFileInfo: any, allFiles: Array<any>) {
    const fileName: string = cdTextFileInfo.fileName.trim().toLowerCase();
    this.logger.log('i got you this file name for cd text:', fileName);
    for (const fileObj of allFiles) {
      if (fileObj.fileName.toLowerCase() === fileName) {
        this.logger.log('i think i have the cd text resumable file obj:', fileObj);
        this.readAsBinary(fileObj.file);
      }
    }
  }

  byteToArray(inByte): number[] {
    const bits = [];
    for (let i = 7; i >= 0; i--) {
      const bit = inByte && (1 << i) ? 1 : 0;
      bits.push(bit);
    }
    return bits;
  }

  readAsBinary(cdTextFile: File) {
    const reader = new FileReader();
    // let dv: DataView;
    let cdTextArrBuf: ArrayBuffer = null;
    const blob = cdTextFile.slice(0, cdTextFile.size);
    reader.onload = (e: any) => {
      cdTextArrBuf = e.target.result;
      this.parseCdText(cdTextArrBuf);
    };
    reader.readAsArrayBuffer(blob);
  }
}
