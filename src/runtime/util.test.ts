import * as util from './util';

describe('util', () => {
  it('should join urls', () => {
    expect(util.joinUrl('http://example.com/', '/foo')).toEqual(
      'http://example.com/foo',
    );
    expect(util.joinUrl('http://example.com', 'foo')).toEqual(
      'http://example.com/foo',
    );
    expect(util.joinUrl('http://example.com', '/foo')).toEqual(
      'http://example.com/foo',
    );
    expect(util.joinUrl('//example.com/', '/foo')).toEqual('//example.com/foo');
    expect(util.joinUrl(undefined, '/foo')).toEqual('/foo');
    expect(util.joinUrl('/', '/foo')).toEqual('/foo');
    expect(util.joinUrl('', '/foo/')).toEqual('/foo/');
  });
});
