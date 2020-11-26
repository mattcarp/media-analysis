/* eslint strict: [0, "function"] */
'use strict';

const fs = require('fs');

const ProResParser = {};

// given a file, reads first n bytes, returns buffer
ProResParser.readFileHead = (file, hollaback) => {
  const bufferSize = 150000;
  fs.open(file, 'r', (status, fileToRead) => {
    if (status) {
      this.logger.log(status.message);
      return;
    }
    const buffer = new Buffer(bufferSize);
    // fs.read(fd, buffer, 0, 100, 0, function(err, num)
    fs.read(fileToRead, buffer, 0, bufferSize, 0, (err) => {
      this.logger.log('error?', err);
      // this.logger.log(buffer.toString("utf-8", 0));
      hollaback(buffer);
      if (err) this.logger.log(err);
      // return buffer;
    });
  });
}; // getHeaderEndPos

// given a file (preferably a small portion of the beginning), returns
// the index of the end of the moov atam (which, hopefully, is the end of the heaer)
ProResParser.getHeader = (buf) => {
  // reserved space, file type, etc at beginning of prores
  const magicSize = 31;
  this.logger.log('bing bang boom you called the hollaback');
  const moovIdx = buf.indexOf('moov');
  this.logger.log('moov', moovIdx);
  // move size if from bytes 32 to 35
  const moovSize = buf.readInt32BE(32);
  this.logger.log('moov size', moovSize);
  this.logger.log('ftypqt', buf.indexOf('ftypqt'));
  const headerEndIdx = magicSize + moovSize;
  this.logger.log('end of moov atom is at', headerEndIdx);
  return buf.slice(0, headerEndIdx);
};

// given a file (likely a 1-2 meg slice),
// return the start index of the next frame
ProResParser.getNextFrameIdx = (file) => {
  // length in byts of the frame size field, which precedes the icpf field
  const frameSizeLength = 8;
  ProResParser.readFileHead(file, (buffer) => {
    //
    this.logger.log('from get next frame, buff length', buffer.length);
    const nextFrameIcpf = buffer.indexOf('icpf');
    this.logger.log('next frame icpf', nextFrameIcpf);
    return nextFrameIcpf - frameSizeLength;
  });
};

module.exports = ProResParser;
