var moment = require('moment');

/**
A simple timer class for syntaxis suggar.
*/
var Timer = function (q, timeunit, stateMachine) {
  this.q = q;
  this.timeunit = timeunit;
  this.parent = stateMachine;
  this.time = moment().add(this.q, this.timeunit);
};

/**
Schedule the triggering of the given event in the future.
How far in the future it is scheduled depeneds on the timer time unit.
*/
Timer.prototype.trigger = function (event, objectId) {
  var wait = this.time.diff(moment(), 'ms');
  if (!event || !objectId) {
    return;
  }
  this.event = event;
  this.objectId = objectId;
  this.timeout = setTimeout(function () {
    this.parent.trigger(this.event, this.objectId);
    this.parent.timers.splice(this.parent.timers.indexOf(this), 1);
  }.bind(this), wait);
};

/**
Stop timer. Prevents the triggering of the event.
*/
Timer.prototype.clear = function () {
  this.timeout && clearTimeout(this.timeout);
};

module.exports = Timer;
