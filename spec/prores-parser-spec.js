/* global describe it expect done */
/* eslint no-console:0 */
const fs = require('fs');

const parser = require('../server-methods/prores-parser.js');
const proresHeadPath = '/Volumes/Transcend/media_test_files/prores/prores_first_150_kilobytes.mov';
// const headerOnly = '/Volumes/Transcend/media_test_files/prores/prores_last_2_megs.mov';


describe('prores parser', () => {
  it('should get moov size on prores head (2 megs)', (done) => {
    // kickin it async style
    parser.readFileHead(proresHeadPath, (buf) => {
      // const duration = result.blackDetect[0].duration;
      console.log('from the prores parser test, readFileHead buf:', buf);
      const header = parser.getHeader(buf);
      // temp - write a file to use later
      // console.log('duh heada:');
      // console.log(header);
      fs.writeFileSync('/Volumes/Transcend/media_test_files/prores/header_from_test.mov', header);

      // console.log(header.toString());
      // TODO jasmine-node says no assertions
      // expect(duration).toBe(0.367034);
      done();
    });
  });


  // it('should determine black duration on prores tail (2 megs)', (done) => {
  //   // kickin it async style
  //   parser.processBlack(tailBlackPath, (result) => {
  //     // const duration = result.blackDetect[0].duration;
  //     console.log('from the tail black test, duration:', result);
  //     expect(result).toBe(0.367034);
  //     done();
  //   });
  // });
});
