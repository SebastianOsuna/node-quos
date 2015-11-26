Quos State Machine
===

State Machine that maintains several objects at the same time.

```javascript
var StateMachine = require('quos').StateMachine;
var sm = new StateMachine();
```

Create states
```javascript
var enterStore = sm.addState({
  name: '*',
  // Only allow people with red shirts
  constraints: function () {
    return this.shirt_color == 'red';
  },
  onEnter: function () {
    console.log('Welcome, ' + this.name);
  }
});

var queue = sm.addState({
  name: 'waitingInQueue',

  onEnter: function (prevState, sm) {
    sm.after(10, 'minutes').trigger('next-in-line', this.id);
  },

  onExit: function () {
    console.log(this.name + ', you are next');
  }

});

var counter = sm.addState({
  name: 'payingInCounter',
  onEnter: function () {
    chargeUser(this.id, this.total_bought);
  },

  onExit: function () {
    console.log('Come back anytime!');
  }
});
```

Define transitions

```javascript
enterStore.on('bought-something', queue);
queue.on('next-in-line', counter);
```

Add objects

```javascript
sm.addObject({ id: 'Customer00012', name: 'Jhon', shirt_color: 'red', total_bought: 9.99 });
sm.addObject({ id: 'Customer00015', name: 'Juan', shirt_color: 'blue', total_bought: 19.99 }); // Rejected
```

Trigger events to change states.

```javascript
sm.trigger('bought-something', 'Customer00012');
```
