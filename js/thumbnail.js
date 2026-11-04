(function (orbium, undefined) {
  // Renders small preview images of levels by reusing the regular tile
  // classes and their drawing code on an offscreen canvas. Thumbnails are
  // generated lazily, a few per animation frame, and cached.
  //
  // Thumbnails are kept as canvases and copied with drawImage, never read
  // back with toDataURL: when the game is opened from file:// the canvas
  // is tainted by the tile images and reading its pixels is forbidden.
  orbium.Thumbnail = function () {
    var PER_FRAME = 4;  // Thumbnails rendered per animation frame
    var SCALE = 1 / 5;  // Thumbnail size relative to the board

    var board = null;   // Offscreen canvas with the full board
    var width = null;   // Thumbnail size in pixels
    var height = null;

    var cache = null;
    var queue = null;
    var scheduled = null;

    this.construct = function () {
      board = document.createElement("canvas");
      board.width = orbium.Tile.size * orbium.Machine.horizTiles;
      board.height = orbium.Tile.size * orbium.Machine.vertTiles;

      width = Math.round(board.width * SCALE);
      height = Math.round(board.height * SCALE);

      cache = {};
      queue = [];
      scheduled = false;
    };

    var createCanvas = function () {
      var canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      return canvas;
    };

    // Canvas to put in the page, filled in later by request()
    this.createTarget = function () {
      return createCanvas();
    };

    var copyTo = function (source, target) {
      var ctx = target.getContext("2d");
      ctx.clearRect(0, 0, target.width, target.height);
      ctx.drawImage(source, 0, 0, target.width, target.height);
    };

    var cacheKey = function (levnr) {
      return orbium.packs[orbium.pack_idx].id + ":" + levnr;
    };

    // Draw one level and return it as a small canvas
    var render = function (levnr) {
      var machine = orbium.machine;
      var level = orbium.level[levnr];

      // Tiles read machine.tiles (setBase) and machine.levnr (Clock),
      // so swap them temporarily and always restore them
      var savedTiles = machine.tiles;
      var savedLevnr = machine.levnr;
      var savedCtx = orbium.ctx;

      var scratch = {tiles: []};
      var ctx = board.getContext("2d");

      try {
        machine.levnr = levnr;

        var count = 0;
        for (var ynr = 0; ynr < orbium.Machine.vertTiles; ynr++) {
          for (var xnr = 0; xnr < orbium.Machine.horizTiles; xnr++) {
            machine.createTile.call(scratch, level[count], count, xnr, ynr);
            count++;
          }
        }

        machine.tiles = scratch.tiles;

        for (var i = 0, j = scratch.tiles.length; i < j; i++) {
          scratch.tiles[i].setBase();
        }

        ctx.save();
        ctx.clearRect(0, 0, board.width, board.height);
        ctx.translate(0, -orbium.Bar.height); // Tiles are placed below the bar
        orbium.ctx = ctx;

        for (i = 0, j = scratch.tiles.length; i < j; i++) {
          scratch.tiles[i].draw(0);
          scratch.tiles[i].draw(1);
          scratch.tiles[i].draw(2);
        }
      } finally {
        ctx.restore();

        orbium.ctx = savedCtx;
        machine.tiles = savedTiles;
        machine.levnr = savedLevnr;

        for (i = 0, j = scratch.tiles.length; i < j; i++) {
          scratch.tiles[i].destruct();
        }
      }

      var small = createCanvas();
      copyTo(board, small);

      return small;
    };

    var process = function () {
      scheduled = false;

      // Wait until all images are loaded
      if (!orbium.machine.loaded) {
        schedule();
        return;
      }

      for (var n = 0; n < PER_FRAME && queue.length > 0; n++) {
        var job = queue.shift();
        var key = cacheKey(job.levnr);

        if (cache[key] === undefined) {
          try {
            cache[key] = render(job.levnr);
          } catch (e) {
            cache[key] = null; // Leave the placeholder
          }
        }

        if (cache[key] !== null) {
          copyTo(cache[key], job.target);
        }
      }

      if (queue.length > 0) {
        schedule();
      }
    };

    var schedule = function () {
      if (!scheduled) {
        scheduled = true;
        window.requestAnimationFrame(process);
      }
    };

    // Draw the thumbnail of levnr on target, now if cached, later otherwise
    this.request = function (levnr, target) {
      var cached = cache[cacheKey(levnr)];

      if (cached) {
        copyTo(cached, target);
        return;
      }

      queue.push({levnr: levnr, target: target});
      schedule();
    };

    // Forget pending requests, e.g. when the grid is rebuilt
    this.cancel = function () {
      queue.length = 0;
    };

    // Forget cached images, e.g. when levels are edited
    this.clear = function () {
      cache = {};
    };

    this.construct.apply(this, arguments);
  };
})(typeof window == "object" ? window.orbium = window.orbium || {} : orbium);
