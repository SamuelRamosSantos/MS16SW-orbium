(function (orbium, undefined) {
  orbium.Tutorial = function () {
    var textFactor = 5;

    var tutorial0 = null;

    var enabled = null;
    var t = null;

    var entries = [
      {
        touchText: "TAP CAROUSEL TO ROTATE IT",
        clickText: "CLICK CAROUSEL TO ROTATE IT",
        left: Math.round(orbium.Tile.size * 5 + orbium.Marble.size / 3),
        top: Math.round(orbium.Marble.size * 2),
        width: Math.round(orbium.Tile.size * 2.0),
        height: Math.round(orbium.Marble.size * 1.7),
        fromSeconds: 2,
        toSeconds: 5
      }, {
        touchText: "SWIPE OVER ORB TO LAUNCH IT",
        clickText: "CLICK ORB TO LAUNCH IT",
        left: Math.round(orbium.Tile.size * 5 + orbium.Marble.size / 3),
        top: Math.round(orbium.Marble.size * 2),
        width: Math.round(orbium.Tile.size * 2.0),
        height: Math.round(orbium.Marble.size * 1.7),
        fromSeconds: 6,
        toSeconds: 10
      }, {
        touchText: "FILL CAROUSEL WITH 4 ORBS OF THE SAME COLOR TO EXPLODE IT",
        clickText: "FILL CAROUSEL WITH 4 ORBS OF THE SAME COLOR TO EXPLODE IT",
        left: Math.round(orbium.Tile.size / 2),
        top: Math.round(orbium.Marble.size * 2.2),
        width: Math.round(orbium.Tile.size * 2.1),
        height: Math.round(orbium.Marble.size * 3.4),
        fromSeconds: 11,
        toSeconds: 17
      }, {
        touchText: "EXPLODE ALL CAROUSELS TO COMPLETE LEVEL",
        clickText: "EXPLODE ALL CAROUSELS TO COMPLETE LEVEL",
        left: Math.round(orbium.Tile.size / 2),
        top: Math.round(orbium.Marble.size * 2.2),
        width: Math.round(orbium.Tile.size * 2.1),
        height: Math.round(orbium.Marble.size * 2.5),
        fromSeconds: 18,
        toSeconds: 22
      }, {
        touchText: "TAP ABOVE TO PAUSE AND SHOW MENU",
        clickText: "CLICK ABOVE TO PAUSE AND SHOW MENU",
        left: Math.round(orbium.Tile.size / 2),
        top: Math.round(orbium.Tile.size * 3 + orbium.Marble.size * 1.6),
        width: Math.round(orbium.Tile.size * 2.0),
        height: Math.round(orbium.Marble.size * 2.5),
        fromSeconds: 23,
        toSeconds: 27
      }, {
        touchText: "SHOWS COLOR OF NEXT ORB",
        clickText: "SHOWS COLOR OF NEXT ORB",
        left: Math.round(orbium.Tile.size * 5.5),
        top: Math.round(orbium.Tile.size * 3 + orbium.Marble.size * 1.6),
        width: Math.round(orbium.Tile.size * 2.0),
        height: Math.round(orbium.Marble.size * 1.7),
        fromSeconds: 28,
        toSeconds: 32
      }
    ];

    var current = null;

    var showing = null;
    var fromSeconds = null;
    var toSeconds = null;

    this.construct = function () {
      tutorial0 = document.getElementById("tutorial0");

      var margin = Math.round(orbium.Marble.size / 6);
      tutorial0.style.padding = "" + margin + "px";

      this.reset();
    };

    this.reset = function () {
      // If not set set it to true
      enabled = orbium.storage.readValue("tutorial");
      if (enabled === null) {
        orbium.storage.writeValue("tutorial", true);
      }

      // Find if tutorial is enabled
      enabled = orbium.storage.readValue("tutorial");
      enabled = enabled === "true";

      if (this.checkDisableTutorial()) {
        enabled = false;
      }

      t = 0;

      current = 0;
      showing = false;
      fromSeconds = 0;
      toSeconds = 0;
    };

    this.checkDisableTutorial = function () {
      // Disable tutorial if in editor mode
      return !!orbium.Machine.editorMode;
    };

    this.show = function () {
      showing = true;

      var entry = entries[current];

      var left = orbium.xpos + entry.left;
      var top = orbium.ypos + entry.top;
      var width = entry.width;
      var height = entry.height;
      var fontSize = Math.round(orbium.Tile.size / textFactor);

      tutorial0.style.left = "" + left + "px";
      tutorial0.style.top = "" + top + "px";
      tutorial0.style.width = "" + width + "px";
      tutorial0.style.height = "" + height + "px";
      tutorial0.style.fontSize = "" + fontSize + "px";

      if (orbium.has_touch_screen) {
        tutorial0.innerHTML = entry.touchText;
      } else {
        tutorial0.innerHTML = entry.clickText;
      }

      tutorial0.style.visibility = "visible";
    };

    this.hide = function () {
      showing = false;

      tutorial0.style.visibility = "hidden";

      current++;
    };

    this.update = function (dt) {
      t += dt;

      if (enabled && orbium.machine.levnr === 0 &&
        current < entries.length) {
        fromSeconds = entries[current].fromSeconds;
        toSeconds = entries[current].toSeconds;

        if (t > fromSeconds && t < toSeconds && !showing) {
          this.show();
        } else if (t > toSeconds && showing) {
          this.hide();
        }
      }
    };

    this.construct.apply(this, arguments);
  };
})(typeof window == "object" ? window.orbium = window.orbium || {} : orbium);
