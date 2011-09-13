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
var Header = require('./header')

var Response = exports.Response = function(socket, rinfo, header) {
  this._socket = socket
  this._rinfo = rinfo

  this.header = new Header()
  this.header.qr = 1
  this.header.id = header.id

  this.question = []
  this.answer = []
  this.authority = []
  this.additional = []
}

Response.prototype.send = function() {
  this.header.qdcount = this.question.length
  this.header.ancount = this.answer.length
  this.header.nscount = this.authority.length
  this.header.arcount = this.additional.length

  var message = this.header.pack()

  function append(arrs) {
    for (var i=0; i<arrs.length; i++) {
      var a = arrs[i]
      message = Buffer.concat(message, a.pack())
    }
  }

  append(this.question)
  append(this.answer)
  append(this.authority)
  append(this.additional)

  this._socket.send(message, 0, message.length, this._rinfo.port, this._rinfo.address)
}

module.exports = Response
