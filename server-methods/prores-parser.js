/* eslint strict: [0, "function"] */
'use strict';

const fs = require('fs');
const bunyan = require('bunyan');
const log = bunyan.createLogger({ name: 'black-route' });
const ProResParser = {};

// given a file path as a string, reads first n bytes, returns buffer
ProResParser.readFileHead = (file, hollaback) => {
  const bufferSize = 150000;
  fs.open(file, 'r', (status, fileToRead) => {
    if (status) {
      log.info(status.message);
      return;
    }
    const buffer = new Buffer(bufferSize);
    // fs.read(fd, buffer, 0, 100, 0, function(err, num)
    fs.read(fileToRead, buffer, 0, bufferSize, 0, (err) => {
      log.info('error?', err);
      // log.info(buffer.toString('utf-8', 0));
      hollaback(buffer);
      if (err) log.info(err);
      // return buffer;
    });
  });
}; // getHeaderEndPos

// given a file (preferably a small portion of the beginning), returns
// the index of the end of the moov atam (which, hopefully, is the end of the heaer)
ProResParser.getHeader = (buf) => {
  // reserved space, file type, etc at beginning of prores
  const magicSize = 31;
  log.info('bing bang boom you called the hollaback');
  const moovIdx = buf.indexOf('moov');
  log.info('moov', moovIdx);
  // move size is from bytes 32 to 35
  const moovSize = buf.readInt32BE(32);
  log.info('moov size', moovSize);
  log.info('ftypqt', buf.indexOf('ftypqt'));
  const headerEndIdx = magicSize + moovSize;
  log.info('end of moov atom is at', headerEndIdx);

  const header = buf.slice(0, headerEndIdx);
  // temp - write a file to use later
  fs.writeFileSync('/Volumes/Transcend/media_test_files/prores/header_from_test.mov', header);
  // temp append some stuff to the header
  // fs.readFileSync('');
  fs.appendFileSync('/Volumes/Transcend/media_test_files/prores/header_from_test.mov',
    'Some more text to append.', (err) => {
      if (err) throw err;
      log.info('Appended!');
    });

  return header;
};

// given a file (likely a 1-2 meg slice),
// return the start index of the next frame
ProResParser.getNextFrameIdx = (file) => {
  // length in byts of the frame size field, which precedes the icpf field
  const frameSizeLength = 8;
  ProResParser.readFileHead(file, (buffer) => {
    //
    log.info('from get next frame, buff length', buffer.length);
    const nextFrameIcpf = buffer.indexOf('icpf');
    log.info('next frame icpf', nextFrameIcpf);
    return nextFrameIcpf - frameSizeLength;
  });
};


module.exports = ProResParser;
