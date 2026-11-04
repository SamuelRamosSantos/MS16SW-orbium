(function (orbium, undefined) {
  orbium.Stats = function () {
    var KEY = "stats";

    var data = null;
    var levelTime = null; // Seconds spent in the current attempt
    var tracking = null;  // True while an attempt is in progress

    this.construct = function () {
      levelTime = 0;
      tracking = false;
      data = load();
    };

    var empty = function () {
      return {
        totalTime: 0,
        explosions: 0,
        levels: {}
      };
    };

    // Read stats from storage, falling back to empty stats if the stored
    // value is missing, corrupt or storage is unavailable.
    var load = function () {
      try {
        var raw = orbium.storage.readValue(KEY);
        var obj = raw ? JSON.parse(raw) : null;

        if (obj !== null && typeof obj === "object" &&
          typeof obj.levels === "object" && obj.levels !== null) {
          obj.totalTime = Number(obj.totalTime) || 0;
          obj.explosions = Number(obj.explosions) || 0;
          return obj;
        }
      } catch (e) {
        // Ignore and start over
      }

      return empty();
    };

    var save = function () {
      try {
        orbium.storage.writeValue(KEY, JSON.stringify(data));
      } catch (e) {
        // Storage full or unavailable, stats are kept in memory only
      }
    };

    var level = function (levnr) {
      if (data.levels[levnr] === undefined) {
        data.levels[levnr] = {attempts: 0, completions: 0, bestTime: null};
      }

      return data.levels[levnr];
    };

    var enabled = function () {
      return !orbium.Machine.editorMode;
    };

    this.startAttempt = function (levnr) {
      if (!enabled()) {
        return;
      }

      levelTime = 0;
      tracking = true;
      level(levnr).attempts++;
      save();
    };

    this.tick = function (dt) {
      if (!enabled() || !tracking) {
        return;
      }

      levelTime += dt;
      data.totalTime += dt;
    };

    this.explosion = function () {
      if (!enabled() || !tracking) {
        return;
      }

      data.explosions++;
    };

    this.complete = function (levnr) {
      if (!enabled() || !tracking) {
        return;
      }

      var lvl = level(levnr);
      lvl.completions++;

      if (lvl.bestTime === null || levelTime < lvl.bestTime) {
        lvl.bestTime = levelTime;
      }

      tracking = false;
      save();
    };

    this.fail = function () {
      if (!enabled() || !tracking) {
        return;
      }

      tracking = false;
      save();
    };

    // Persist time played so far, used when the game is paused
    this.flush = function () {
      if (enabled()) {
        save();
      }
    };

    this.reset = function () {
      data = empty();
      tracking = false;
      levelTime = 0;
      save();
    };

    this.getSummary = function () {
      var attempts = 0;
      var completions = 0;
      var levels = [];

      for (var key in data.levels) {
        if (data.levels.hasOwnProperty(key)) {
          var lvl = data.levels[key];

          attempts += lvl.attempts;
          completions += lvl.completions;

          levels.push({
            levnr: parseInt(key),
            attempts: lvl.attempts,
            completions: lvl.completions,
            bestTime: lvl.bestTime
          });
        }
      }

      levels.sort(function (a, b) {
        return a.levnr - b.levnr;
      });

      return {
        totalTime: data.totalTime,
        explosions: data.explosions,
        attempts: attempts,
        completions: completions,
        completionRate: attempts > 0 ? completions / attempts : 0,
        levels: levels
      };
    };

    this.construct.apply(this, arguments);
  };

  orbium.Stats.formatTime = function (seconds) {
    if (seconds === null || seconds === undefined) {
      return "--:--";
    }

    var total = Math.floor(seconds);
    var h = Math.floor(total / 3600);
    var m = Math.floor((total % 3600) / 60);
    var s = total % 60;

    var pad = function (n) {
      return n < 10 ? "0" + n : "" + n;
    };

    if (h > 0) {
      return pad(h) + ":" + pad(m) + ":" + pad(s);
    }

    return pad(m) + ":" + pad(s);
  };
})(typeof window == "object" ? window.orbium = window.orbium || {} : orbium);
