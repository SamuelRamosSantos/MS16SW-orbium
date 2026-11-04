(function (orbium, undefined) {
  // Só é possível lançar enquanto houver menos bolinhas ativas que este valor
  var MAX_ACTIVE_MARBLES = 4;

  // Só é possível cair de um tile de queda enquanto houver menos bolinhas
  // ativas que este valor
  var ACTIVE_MARBLES_LIMIT_FOR_FALL = 3;

  orbium.Counter = function (count, xnr, ynr) {
    var activeMarbles = null;

    this.construct = function () {
      activeMarbles = 0;

      orbium.Tile.prototype.construct.call(this, ["counter0"], count,
        xnr, ynr);
    };

    this.countActiveMarbles = function () {
      var count = 0;

      for (var i = 0, j = orbium.machine.marbles.length; i < j; i++) {
        if (!orbium.machine.marbles[i].fresh) {
          count++;
        }
      }

      if (count < MAX_ACTIVE_MARBLES) {
        activeMarbles = count;
      } else {
        activeMarbles = MAX_ACTIVE_MARBLES;
      }

      this.setImage(0, "counter" + activeMarbles);
      this.invalidate();
    };

    this.isLaunchAllowed = function () {
      return activeMarbles < MAX_ACTIVE_MARBLES;
    };

    this.isFallAllowed = function () {
      return activeMarbles < ACTIVE_MARBLES_LIMIT_FOR_FALL;
    };

    this.tap = function (xtap, ytap) {
      orbium.menu.pause();
    };

    this.construct.apply(this, arguments);
  };

  orbium.Counter.prototype = new orbium.Tile();
  orbium.Counter.prototype.constructor = orbium.Counter;
})(typeof window == "object" ? window.orbium = window.orbium || {} : orbium);
