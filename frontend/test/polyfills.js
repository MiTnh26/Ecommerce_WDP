// test/polyfills.js

// 1) fetch & friends
require('whatwg-fetch');

// 2) TextEncoder/TextDecoder
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// 3) TransformStream
try {
  const { TransformStream } = require('stream/web');
  global.TransformStream = TransformStream;
} catch {
  const { TransformStream } = require('web-streams-polyfill/ponyfill');
  global.TransformStream = TransformStream;
}

// 4) BroadcastChannel stub
class FakeBroadcastChannel {
  constructor(name) { this.name = name; }
  postMessage() { /* no-op */ }
  addEventListener() { /* no-op */ }
  removeEventListener() { /* no-op */ }
  close() { /* no-op */ }
}
global.BroadcastChannel = FakeBroadcastChannel;
