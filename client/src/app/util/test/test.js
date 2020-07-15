/* eslint-env node, mocha */
/* eslint strict: [0, "function"] */
'use strict';
const assert = require('assert');

const p = require('../prores-parser.js');
const path = '/Volumes/Transcend/media_test_files/prores/';


describe('ProRes Parser', () => {
  describe('Module ProRes', () => {
    it('should have a readFileHeader Method', () => {
      assert.equal(typeof p, 'object');
      assert.equal(typeof p.readFileHeader, 'function');
    });
  });
});

describe('ProRes Parser', () => {
  const f = `${path}prores_first_2_megs.mov`;
  it('should get length of prores header', (buf) => {
    let result1 = 0;
    p.readFileHead(f, (buffer) => {
      console.log('from the test, buffer length', buffer.length);
      result1 = p.getHeader(buffer);
      console.log('length of result from test on getHeader', result1.length);
      assert.equal(result1.length, 40297);
      // done();
      // const result2 = p.getheader(buf);
      // console.log('length of the header:', result2.length);
    });
  });
});

describe('ProRes Parser', () => {
  const f = `${path}prores_last_2_megs.mov`;
  it('should get next frame index', (done) => {
    p.getNextFrameIdx(f, (nextFrame) => {
      console.log('length of result from test on getHeader', nextFrame);
      assert.equal(nextFrame, 40297);
      done();
    });
  });
});
