/* global describe it */
/* exported should */

const should = require('chai').should();
const blackDetect = require('../server-methods/black-detect');

const idxPath = '/Users/mcarpent/Dropbox/projects/media-analysis/client/index.html';


describe('getIndex', () => {
  it('converts the index.html to a stream', () => {
    const idxData = ngDeploy.getIndex(idxPath);
    idxData.should.contain('doctype html');
  });

  // it('converts " into &quot;', function() {
  //   escape('"').should.equal('&quot;');
  // });
});
//
describe('getJsLinks', () => {
  it('gets an array of javascript links', () => {
    const idxData = ngDeploy.getIndex(idxPath);
    ngDeploy.getJsLinks(idxData).length.should.equal(10);
  });
//
//   it('converts &quot; into "', function() {
//     unescape('&quot;').should.equal('"');
//   });
});
