/* global describe it expect done */
/* eslint no-console:0 */

import { expect } from '../node_modules/jasmine-node/lib/jasmine-node/jasmine-1.3';
const blackDetect = require('../server-methods/black-detect.js');
const headBlackPath = '/Volumes/Transcend/media_test_files/prores/prores_first_2_megs.mov';
const tailBlackPath = '/Volumes/Transcend/media_test_files/prores/prores_last_2_megs.mov';


describe('black detection', () => {
  it('should determine black duration on prores head (2 megs)', (done) => {
    // kickin it async style
    blackDetect.processBlack(headBlackPath, (result) => {
      const duration = result.blackDetect[0].duration;
      console.log('from the head black test, duration:', duration);
      // TODO jasmine-node says no assertions
      expect(duration).toBe(0.367034);
      done();
    });
  });

  it('should determine black duration on prores tail (2 megs)', (done) => {
    // kickin it async style
    blackDetect.processBlack(tailBlackPath, (result) => {
      // const duration = result.blackDetect[0].duration;
      console.log('from the tail black test, duration:', result);
      expect(result).toBe(0.367034);
      done();
    });
  });
});
