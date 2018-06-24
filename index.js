var Benchmark = require('benchmark');
var tb = require('travis-benchmark');
var _ = require('lodash');
var async = require('async');
var foreach = require('foreach');
var arrayEach = require('array-each');

var EventEmitter = require('events');
var EventEmitter2 = require('event-emitter');
var EventEmitter3 = require('eventemitter3');
var Ultron = require('ultron');
var TinyEmitter = require('tiny-emitter');

async.timesSeries(
  15,
  function(t, next) {
    // [events]
    var count = Math.pow(2, t);
    var suite = new Benchmark.Suite(`${count} list size`);
    
    var eventEmitter = new EventEmitter();
    eventEmitter.setMaxListeners(0);
    _.times(count, function() { eventEmitter.on('test', function() {}); });
    suite.add('[events] events', function() {
      eventEmitter.emit('test', 123);
    });
    
    var eventEmitter2 = new EventEmitter2();
    _.times(count, function() { eventEmitter2.on('test', function() {}); });
    suite.add('[events] event-emitter@0.3.5', function() {
      eventEmitter2.emit('test', 123);
    });
    
    var eventEmitter3 = new EventEmitter3();
    _.times(count, function() { eventEmitter3.on('test', function() {}); });
    suite.add('[events] eventemitter3@3.1.0', function() {
      eventEmitter3.emit('test', 123);
    });
    
    var eventEmitterUltron = new Ultron(new EventEmitter());
    eventEmitterUltron.ee.setMaxListeners(0);
    _.times(count, function() { eventEmitterUltron.on('test', function() {}); });
    suite.add('[events] ultron@1.1.1 of events', function() {
      eventEmitterUltron.ee.emit('test', 123);
    });
    
    var eventEmitter3Ultron = new Ultron(new EventEmitter3());
    _.times(count, function() { eventEmitter3Ultron.on('test', function() {}); });
    suite.add('[events] ultron@1.1.1 of eventemitter3@3.1.0', function() {
      eventEmitter3Ultron.ee.emit('test', 123);
    });
    
    var tinyEmitter = new TinyEmitter();
    _.times(count, function() { tinyEmitter.on('test', function() {}); });
    suite.add('[events] tinyEmitter@2.0.2', function() {
      tinyEmitter.emit('test', 123);
    });
    
    // [array]
    var array = [];
    var arrayAsync = [];
    for (var i = 0; i < count; i++) {
      array.push(function() {});
      arrayAsync.push(function(next) { next(); });
    }

    suite.add('[array] for', function() {
      for (var i = 0; i < count; i++) {
        array[i]();
      };
    });
    suite.add('[array] while', function() {
      var i = 0;
      while (i < count) {
        array[i]();
        i++;
      }
    });
    suite.add('[array] for-in', function() {
      for (var i in array) {
        array[i]();
      }
    });
    suite.add('[array] for-of', function() {
      for (var f of array) {
        f();
      }
    });
    suite.add('[array] forEach', function() {
      array.forEach(function(value, index) {
        value();
      });
    });
    suite.add('[array] lodash@4.17.10 forEach', function() {
      _.forEach(array, function(value, index) {
        value();
      });
    });
    suite.add('[array] async@2.6.1 forEachOf', function() {
      async.forEachOf(array, function(value, index, next) {
        value();
        next();
      });
    });
    suite.add('[array] async@2.6.1 forEachOfSeries', function() {
      async.forEachOfSeries(array, function(value, index, next) {
        value();
        next();
      });
    });
    suite.add('[array] async@2.6.1 series', function() {
      async.series(arrayAsync);
    });
    suite.add('[array] foreach@2.0.5', function() {
      foreach(array, function(value, index) {
        value();
      });
    });
    suite.add('[array] array-each@1.0.1', function() {
      arrayEach(array, function(value, index) {
        value();
      });
    });
    
    // [object]
    var object = {};
    var objectAsync = {};
    for (var i = 0; i < count; i++) {
      object[i] = function() {};
      objectAsync[i] = function(next) { next(); };
    }
    
    suite.add('[object] for-in', function() {
      for (var i in object) {
        object[i]();
      }
    });
    suite.add('[object] lodash@4.17.10 forEach', function() {
      _.forEach(object, function(value, index) {
        value();
      });
    });
    suite.add('[object] async@2.6.1 forEachOf', function() {
      async.forEachOf(object, function(value, index, next) {
        value();
        next();
      });
    });
    suite.add('[object] async@2.6.1 forEachOfSeries', function() {
      async.forEachOfSeries(object, function(value, index, next) {
        value();
        next();
      });
    });
    suite.add('[object] async@2.6.1 series', function() {
      async.series(objectAsync);
    });
    suite.add('[object] foreach@2.0.5', function() {
      foreach(object, function(value, index) {
        value();
      });
    });
    
    // [linked-list]
    (function() {
      var start = { listener: function() {}, next: null };
      var last = start;
      _.times(count, function() {
        var next = { listener: function() {}, next: null };
        last.next = next;
        last = next;
      });
      suite.add('[linked-list] while', function() {
        var pointer = start;
        while (pointer) {
          pointer.listener();
          pointer = pointer.next;
        }
      });
      suite.add('[linked-list] for', function() {
        for (var pointer = start; pointer; pointer = pointer.next) {
          pointer.listener();
        }
      });
    })();
    
    tb.wrapSuite(suite, function() { next(); });
    suite.run({ async: true });
  }
);
