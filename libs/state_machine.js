var EventEmitter = require('events').EventEmitter,
    State = require('./state'),
    Timer = require('./timer');


/**
New state machine constructor.
**/
var StateMachine = function (setup) {
  this.states = {};
  this.objectRegistry = {};
  this.timers = [];
};

/**
Create a new state.
The state object must have:
- name: string. Must be a unique name.
- onEnter: function(state, stateMachine). Triggered everytime a new object enters this state.
- onExit: function(state, stateMachine). Triggered everytime an object leaves this state.
- constraints: function. Validates an object before accepting a new object.
*/
StateMachine.prototype.addState = function (state) {
  if (!state || !state.name) {
    throw 'All states must have an unique name.';
  }
  if (this.states[state.name]) {
    throw "State " + state.name + " already defined.";
  }
  return this.states[state.name] = new State(this, state);
};

/**
Timing helper function.
Used to schedule state changes in the future.
- q: integer. Time unit depending on the timeunit value.
- timeunit: 'seconds'|'hours'|'days'. Time length
*/
StateMachine.prototype.after = function (q, timeunit) {
  var timer = new Timer(q, timeunit, this);
  this.timers.push(timer);
  return timer;
};

/**
Triggers an event in the given objects current state.
This is intended to trigger an state change.
- event: string. Event name.
- objectId: any. Id property of the object being targeted.
**/
StateMachine.prototype.trigger = function (event, objectId) {
  if (!event || !objectId) {
    return;
  }
  var _ref = this.objectRegistry[objectId];
  if (!_ref) {
    return;
  }

  _ref.s.trigger(event, objectId);
};

/**
Clear all timers that belong to the given object.
*/
StateMachine.prototype._clearTimers = function (objectId) {
  this.timers = this.timers.filter(function (t) {
    if (t.objectId === objectId) {
      t.clear();
      return false;
    }
    return true;
  });
};

/**
Add new object. Every new object begins in the initial state identified with the name '*'.
- object: any.
**/
StateMachine.prototype.addObject = function (object) {
  if (!object.id) {
    throw "New objects must have an unique 'id' property."
  }
  if (!!this.objectRegistry[object.id]) {
    throw "Object with id " + object.id + " already registered";
  }
  var state = this.states['*'];
  state.addObject(object);
};

StateMachine.prototype._serialize = function () {
  return {
    objectRegistry: Object.keys(this.objectRegistry).map(function (k) { return { o: this.objectRegistry[k].o, s: this.objectRegistry[k].s.name }; }),
    timers: this.timers.map(function (t) { return t.serialize(); })
  };
};

module.exports = StateMachine;
