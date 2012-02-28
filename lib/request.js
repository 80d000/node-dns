/*
Copyright 2012 Timothy J Fontaine <tjfontaine@gmail.com>

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

"use strict";

var EventEmitter = require('events').EventEmitter,
  PendingRequests = require('./pending'),
  util = require('util');

var IN_FLIGHT = new PendingRequests();

var Request = function (opts) {
  this.question = opts.question;
  this.server = opts.server;
  this.timeout = opts.timeout || 4 * 1000;
  this.try_edns = opts.try_edns || false;

  this.fired = false;
  this.id = undefined;
};
util.inherits(Request, EventEmitter);

Request.prototype.handle = function (err, answer) {
  if (!this.fired) {
    this.emit('message', err, answer);
    this.done();
  }
};

Request.prototype.done = function () {
  this.fired = true;
  clearTimeout(this.timer_);
  IN_FLIGHT.remove(this);
  this.emit('end');
  this.id = undefined;
};

Request.prototype.timeout = function () {
  if (!this.fired) {
    this.emit('timeout');
    this.done();
  }
};

Request.prototype.send = function () {
  var self = this;

  this.timer_ = setTimeout(function () {
    self.timeout();
  });

  IN_FLIGHT.send(this);
};

Request.prototype.cancel = function () {
  this.emit('cancelled');
  this.done();
};

module.exports = function (opts) {
  return new Request(opts);
};
