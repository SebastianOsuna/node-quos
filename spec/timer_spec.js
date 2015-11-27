var Timer = require('../libs/timer'),
    moment = require('moment');

describe("Timer", function () {
  describe("trigger time", function () {
    it("should be calculated correctly", function () {
      var t = new Timer(10, 'seconds');
      // There are a couple ms lost. Moment rounds down.
      expect(t.time.diff(moment(), 'seconds')).toEqual(9);
    });
  });

  describe("scheduled triggers", function () {

    var parentStub = {
      timers: [],
      trigger: function () {}
    };

    it("should be created after calling #trigger", function () {
      var t = new Timer(20, 'seconds', parentStub);
      t.trigger('some-event', 1);
      expect(t.timeout).not.toBe(undefined);
      // Clean up
      t.clear();
    });

    it("should be cleared after calling #clear", function () {
      var t = new Timer(20, 'seconds', parentStub);
      t.clear();
      expect(t.timeout).toBe(undefined);
      t.trigger('some-event', 1);
      t.clear();
      expect(t.timeout).toBe(undefined);
    });
  });

  describe("initialization", function () {

    it("should deserialize correctly", function () {
      var s = {
        q: 20,
        timeunit: 'seconds',
        time: moment().add(20, 'seconds').utc().format(),
        event: 'my-event',
        objectId: 432
      };

      var t = Timer._initialize(s);
      expect(t.q).toEqual(20);
      expect(t.timeunit).toEqual('seconds');
      expect(t.event).toEqual('my-event');
      expect(t.objectId).toEqual(432);
      expect(moment(t.time).diff(moment(), 'seconds')).toEqual(19);
      expect(t.timeout).not.toBe(undefined);

      // Clean up
      t.clear();
    });

  });

  describe("serialization", function () {

    var parentStub = {
      timers: [],
      trigger: function () {}
    };

    it("should have correct data if #trigger wasn't called", function () {
      var t = new Timer(20, 'seconds', parentStub);
      var o = t.serialize();
      expect(o.q).toEqual(20);
      expect(o.timeunit).toEqual('seconds');
      expect(o.event).toBe(undefined);
      expect(o.objectId).toBe(undefined);
      expect(moment(o.time).diff(moment(), 'seconds')).toEqual(19);
    });

    it("should have correct data if #trigger was called", function () {
      var t = new Timer(20, 'seconds', parentStub);
      t.trigger('my-event', 234);
      var o = t.serialize();
      expect(o.q).toEqual(20);
      expect(o.timeunit).toEqual('seconds');
      expect(o.event).toEqual('my-event');
      expect(o.objectId).toEqual(234);
      expect(moment(o.time).diff(moment(), 'seconds')).toEqual(19);

      // Clean up
      t.clear();
    });

  });

});
