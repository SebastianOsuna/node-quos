var EventEmitter = require('events').EventEmitter;

/**
State constructor.
- stateMachine: parent state machine
- config.name: string. required. Unique state identifier.
- config.onEnter: function(state, stateMachine). Triggered everytime a new object enters this state.
- config.onExit: function(state, stateMachine). Triggered everytime an object leaves this state.
- config.constraints: function. Validates an object before accepting a new object.
*/
var State = function (stateMachine, config) {
  this.parent = stateMachine
  this.name = config.name;
  this.onEnter = config.onEnter || function () {};
  this.onExit = config.onExit || function () {};
  this.constraints = config.constraints || function () { return true; };
  this.objects = {};
  this.emiter = new EventEmitter();
};

/**
Attempt to add a new object into this state.
It verifies the object satifies the defined constraints function.
The onEnter listener is called and the state machine's object registry is updated.
The object doesn't change states if the constraints are not satisfied.
*/
State.prototype.addObject = function (object, previousState) {
  if (this.constraints.call(object)) {
    this.objects[object.id] = object;
    this.onEnter.call(object, previousState, this.parent);
    // Register new object state
    this.parent.objectRegistry[object.id] = {
      o: object,
      s: this
    };

    return object;
  } else {
    console.log('state ' + this.name + ':', 'Object ' + object.id + ' rejected by constraints.');
  }
};

/**
Trigger any registered state change.
**/
State.prototype.trigger = function () {
  this.emiter.emit.apply(this.emiter, arguments);
};

/**
Registration of events for state change.
- event: string. Event name.
- newState: State. The next state in the state machine.
**/
State.prototype.on = function (event, newState) {
  this.emiter.on(event, function (objectId) {
    var object = this.objects[objectId];
    if (!object) {
      return;
    }
    if (newState.constraints.call(object)) {
      // Element successfully moved
      delete this.objects[objectId];
      this.parent._clearTimers(objectId);
      this.onExit.call(object, newState, this.parent);
      newState.addObject(object);
    }
  }.bind(this));
};

module.exports = State;
