var assert = require('assert');

var BufferStream = module.exports = function (buff) {
  if (!(this instanceof BufferStream))
    return new BufferStream(buff);

  this._pos = 0;
  this.buffer = buff;
  this.length = buff.length;
};

BufferStream.prototype._move = function (step) {
  assert(this._pos + step <= this.buffer.length, "Cannot read beyond buffer");
  this._pos += step;
};

BufferStream.prototype.seek = function (pos) {
  assert(pos >= 0, "Cannot seek behind 0");
  assert(pos <= this.buffer.length, "Cannot seek beyond buffer length");
  this._pos = pos;
};

BufferStream.prototype.toByteArray = function () {
  var arr = [], i;
  for (i = 0; i < this.length; i++) {
    arr.push(this.buffer.readUInt8(i));
  }
  return arr;
};

BufferStream.prototype.tell = function () {
  return this._pos;
};

BufferStream.prototype.eob = function () {
};

BufferStream.prototype.slice = function (length) {
  var b = new BufferStream(this.buffer.slice(this._pos, this._pos + length));
  this.seek(this._pos + length);
  return b;
};

BufferStream.prototype.readUInt8 = function () {
  var ret = this.buffer.readUInt8(this._pos);
  this._move(1);
  return ret
};

BufferStream.prototype.readUInt16BE = function () {
  var ret = this.buffer.readUInt16BE(this._pos);
  this._move(2);
  return ret;
};

BufferStream.prototype.readUInt32BE = function () {
  var ret = this.buffer.readUInt32BE(this._pos);
  this._move(4);
  return ret;
};
