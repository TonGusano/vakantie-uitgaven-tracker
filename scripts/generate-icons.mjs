import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function createIconPng(size) {
  const bgColor = [15, 23, 42];
  const fgColor = [56, 189, 248];
  const raw = Buffer.alloc(size * (1 + size * 4));
  const center = size / 2;
  const radius = size * 0.32;

  for (let y = 0; y < size; y++) {
    const rowStart = y * (1 + size * 4);
    raw[rowStart] = 0; // PNG scanline filter byte (0 = none)
    for (let x = 0; x < size; x++) {
      const dx = x - center;
      const dy = y - center;
      const inside = dx * dx + dy * dy <= radius * radius;
      const [r, g, b] = inside ? fgColor : bgColor;
      const offset = rowStart + 1 + x * 4;
      raw[offset] = r;
      raw[offset + 1] = g;
      raw[offset + 2] = b;
      raw[offset + 3] = 255;
    }
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type 6 = RGBA truecolor with alpha
  ihdrData[10] = 0; // compression method (deflate, the only defined value)
  ihdrData[11] = 0; // filter method (the only defined value)
  ihdrData[12] = 0; // interlace method (none)
  const ihdr = chunk('IHDR', ihdrData);
  const idat = chunk('IDAT', deflateSync(raw));
  const iend = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

for (const size of [192, 512]) {
  writeFileSync(new URL(`../icons/icon-${size}.png`, import.meta.url), createIconPng(size));
  console.log(`icon-${size}.png aangemaakt`);
}
