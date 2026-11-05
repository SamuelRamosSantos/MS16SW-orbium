(function (orbium, undefined) {
  orbium.Bar = function (nr) {
    var passed = null;
    this.nr = null;

    this.construct = function () {
      this.nr = nr;
      var xpos = orbium.Tile.size * this.nr;
      var ypos = 0;

      passed = false;

      var images = ["bar" + this.nr];
      orbium.Sprite.prototype.construct.call(this, images, xpos, ypos, orbium.Tile.size, orbium.Bar.height);
    };

    this.setSink = function (isSink) {
      var imageIndex = isSink ? (this.nr + 8) : this.nr;
      this.setImage(0, "bar" + imageIndex);
      this.invalidate();
    };

    this.makePassed = function () {
      if (!passed) {
        passed = true;
        this.setImage(1, "timer1");
        this.invalidate();
      }
    };

    this.clearPassed = function () {
      passed = false;
      this.setImage(1, null);
      this.invalidate();
    };

    this.construct.apply(this, arguments);
  };

  orbium.Bar.prototype = new orbium.Sprite();
  orbium.Bar.prototype.constructor = orbium.Bar;
})(typeof window == "object" ? window.orbium = window.orbium || {} : orbium);
