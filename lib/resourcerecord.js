/*
Copyright 2011 Timothy J Fontaine <tjfontaine@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN

*/

require('bufferjs/concat')

var util = require('util')
var struct = require('struct')

var Message = require('./message')
var name = require('./name')

var ResourceRecord = function(vals) {
  this._base_fields = [
    {
      name: 'name',
      type: 'string',
    },
    {
      name: 'type',
      format: 'H',
    },
    {
      name: 'class',
      format: 'H',
    },
    {
      name: 'ttl',
      format: 'I',
    },
  ]
  Message.call(this)
  
  this.class = 1

  if (vals) {
    for (var k in vals) {
      this[k] = vals[k]
    }
  }
}
util.inherits(ResourceRecord, Message)

ResourceRecord.prototype.pack = function() {
  var self = this
  function iterFields(fields) {
    var ret = new Buffer(0)
    for (var i=0; i<fields.length; i++) {
      var arg = fields[i]
      var buff = undefined
      switch (arg.type) {
        case 'string':
          buff = name.pack(self[arg.name])
          break;
        case 'ipaddr':
          var bytes = self[arg.name].toByteArray()
          var buff = new Buffer(bytes.length)
          for (var j=0; j<bytes.length; j++) {
            buff.writeUInt8(bytes[j], j)
          }
          break;
        default:
          var val = self[arg.name] || 0
          buff = struct.pack('>'+arg.format, val)
          break;
      }
      ret = Buffer.concat(ret, buff)
    }
    return ret
  }

  var ret = iterFields(this._base_fields)

  if (!this.rdata) {
    this.rdata = iterFields(this._rdata_fields)
  }

  return Buffer.concat(ret, struct.pack('>H', this.rdata.length), this.rdata)
}

ResourceRecord.prototype.unpack = function(buff, pos) {
  var start = pos
  for (var i=0; i<this._base_fields.length; i++) {
    var field = this._base_fields[i]
    switch (field.type) {
      case 'string':
        var ret = name.unpack(buff, pos)
        pos = ret.position
        this[field.name] = ret.value
        break;
      default:
        var size = struct.calcsize(field.format)
        this[field.name] = struct.unpack('>'+field.format, buff.slice(pos, pos+size))[0]
        pos += size
        break;
    }
  }

  var size = struct.calcsize('>H')
  var rdata_length = struct.unpack('>H', buff.slice(pos, pos+size))[0]
  pos += size
  this.rdata = buff.slice(pos, pos+rdata_length)
  pos += rdata_length
  return pos - start
}

module.exports = ResourceRecord
