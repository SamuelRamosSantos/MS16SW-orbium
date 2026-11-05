(function (orbium, undefined) {
  orbium.Marble = function (options) {
    options = options || {};
    this.color = null;
    this.frame = null;
    this.direction = null;
    this.fresh = null;
		this.lastDockTry = null;
		this.lastTeleportDest = null;
    this.stale = null;
    this.speed = null;
    this.baseSpeed = null;

    this.framec = null;

    this.construct = function () {
      var xpos = options.xpos !== undefined ? options.xpos : orbium.width;
      var ypos = options.ypos !== undefined ? options.ypos : (orbium.Bar.height / 2 - orbium.Marble.size / 2);

      this.color = options.color !== undefined ? options.color : orbium.machine.nextColor;
      this.frame = options.frame !== undefined ? options.frame : orbium.Util.generateRandomIndex(5);
      this.direction = options.direction !== undefined ? options.direction : 3;
      this.fresh = options.fresh !== undefined ? !!options.fresh : true;

      this.lastDockTry = null;
      this.lastTeleportDest = null;

      this.stale = false;
      this.baseSpeed = orbium.Marble.speed;
      this.speed = this.baseSpeed * (orbium.machine.difficulty || 1);

      var f = this.color * 12 + this.frame;
      var images = ["marble" + f];
      orbium.Sprite.prototype.construct.call(this, images, xpos, ypos, orbium.Marble.size, orbium.Marble.size);

      this.framec = 99;
      this.animate();
    };

    this.destruct = function () {
      orbium.Sprite.prototype.destruct.call(this);
    };

    this.bounce = function () {
      if (this.direction === 0) {
        this.direction = 2;
      } else if (this.direction === 1) {
        this.direction = 3;
      } else if (this.direction === 2) {
        this.direction = 0;
      } else if (this.direction === 3) {
        this.direction = 1;
      }

			this.lastDockTry = null;
			this.lastTeleportDest = null;
    };

    this.animate = function () {
      // Animate the marble every 6th frame
      if (this.framec > 6) {
        if (this.direction === 0) {
          this.frame--;

          if (this.frame < 6) {
            this.frame = 11;
          }
        } else if (this.direction === 1) {
          this.frame++;

          if (this.frame > 5) {
            this.frame = 0;
          }
        } else if (this.direction === 2) {
          this.frame++;

          if (this.frame > 11) {
            this.frame = 6;
          }
        } else if (this.direction === 3) {
          this.frame--;

          if (this.frame < 0) {
            this.frame = 5;
          }
        }

        var f = this.color * 12 + this.frame;

        this.setImage(0, "marble" + f);

        this.framec = 0;
      }

      this.invalidate();
    };

    this.update = function (dt) {
      // Guard against marble coming outside of the screen, should
      // never happen
      if (this.xpos < 0) {
        this.direction = 1;
				this.lastDockTry = null;
      } else if (this.xpos > orbium.width - orbium.Marble.size) {
        this.direction = 3;
				this.lastDockTry = null;
      } else if (this.ypos < 0) {
        this.direction = 2;
				this.lastDockTry = null;
      } else if (this.ypos > orbium.height - orbium.Marble.size) {
        this.direction = 0;
				this.lastDockTry = null;
      }

      // Move the marble
      if (this.direction === 0) {
        this.ypos -= this.speed * dt;
      } else if (this.direction === 1) {
        this.xpos += this.speed * dt;
      } else if (this.direction === 2) {
        this.ypos += this.speed * dt;
      } else if (this.direction === 3) {
        this.xpos -= this.speed * dt;
      }

      this.animate();

      this.framec += this.speed * dt;
    };

    this.getState = function () {
      return {
        xpos: Math.round(this.xpos * 1000) / 1000,
        ypos: Math.round(this.ypos * 1000) / 1000,
        color: this.color,
        frame: this.frame,
        direction: this.direction,
        fresh: this.fresh
      };
    };

    this.construct.apply(this, arguments);
  };

  orbium.Marble.prototype = new orbium.Sprite();
  orbium.Marble.prototype.constructor = orbium.Marble;
})(typeof window == "object" ? window.orbium = window.orbium || {} : orbium);
