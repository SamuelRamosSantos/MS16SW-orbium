(function (orbium, undefined) {
  // Keyboard input. Keeps a tile cursor and converts it into the same
  // pixel coordinates used by mouse/touch (checkTap/checkDrag), so the
  // game mechanics are left untouched.
  orbium.Input = function () {
    // Directions as used by Rotator.launchDirection
    var UP = 0;
    var RIGHT = 1;
    var DOWN = 2;
    var LEFT = 3;

    var arrowKeys = {
      ArrowUp: UP, ArrowRight: RIGHT, ArrowDown: DOWN, ArrowLeft: LEFT
    };

    var launchKeys = {
      KeyW: UP, KeyD: RIGHT, KeyS: DOWN, KeyA: LEFT
    };

    // Arrow shown next to the selected marble, by exit direction
    var ARROWS = ["&#9650;", "&#9654;", "&#9660;", "&#9664;"];

    var cursor0 = null;
    var launch0 = null; // Ring around the marble that X/F will launch
    var arrow0 = null;

    var cx = null;
    var cy = null;
    var active = null; // Cursor is shown after the first key press

    this.construct = function () {
      cursor0 = document.getElementById("cursor0");

      cursor0.style.width = "" + orbium.Tile.size + "px";
      cursor0.style.height = "" + orbium.Tile.size + "px";
      cursor0.style.borderWidth = "" +
        Math.max(2, Math.round(orbium.Tile.size / 36)) + "px";

      launch0 = document.getElementById("launch0");
      arrow0 = document.getElementById("arrow0");

      var ring = Math.round(orbium.Marble.size * 1.5);
      launch0.style.width = "" + ring + "px";
      launch0.style.height = "" + ring + "px";
      launch0.style.borderWidth = "" +
        Math.max(2, Math.round(orbium.Marble.size / 12)) + "px";
      arrow0.style.fontSize = "" + Math.round(orbium.Marble.size * 0.6) + "px";

      cx = Math.floor(orbium.Machine.horizTiles / 2);
      cy = Math.floor(orbium.Machine.vertTiles / 2);
      active = false;
    };

    var playing = function () {
      return orbium.machine.loaded && !orbium.machine.isPaused();
    };

    // Center of the tile under the cursor, in canvas pixels
    var tileX = function () {
      return cx * orbium.Tile.size + orbium.Tile.size / 2;
    };

    var tileY = function () {
      return cy * orbium.Tile.size + orbium.Tile.size / 2 + orbium.Bar.height;
    };

    var move = function (dir) {
      if (dir === UP) {
        cy--;
      } else if (dir === RIGHT) {
        cx++;
      } else if (dir === DOWN) {
        cy++;
      } else {
        cx--;
      }

      cx = Math.min(Math.max(cx, 0), orbium.Machine.horizTiles - 1);
      cy = Math.min(Math.max(cy, 0), orbium.Machine.vertTiles - 1);

      selected = -1; // New tile, start with its first marble
    };

    var rotate = function () {
      orbium.machine.checkTap(tileX(), tileY());
    };

    var launch = function (dir) {
      orbium.machine.checkDrag(tileX(), tileY(), dir);
    };

    var rotatorUnderCursor = function () {
      var tile = orbium.machine.tiles[cy * orbium.Machine.horizTiles + cx];

      return tile instanceof orbium.Rotator ? tile : null;
    };

    // Marble chosen to be launched with X/F, identified by the direction
    // it would leave in, or -1. It is marked on screen by launch0.
    var selected = -1;

    // Exit directions of the marbles that can leave the rotator under the
    // cursor, clockwise starting at the top
    var launchableDirections = function () {
      var rotator = rotatorUnderCursor();
      var dirs = [];

      if (rotator !== null) {
        for (var dir = UP; dir <= LEFT; dir++) {
          if (rotator.canLaunch(dir)) {
            dirs.push(dir);
          }
        }
      }

      return dirs;
    };

    // Keep the selection on a marble that can still leave, e.g. after it
    // was launched or the rotator turned
    var validSelection = function () {
      var dirs = launchableDirections();

      if (dirs.indexOf(selected) === -1) {
        selected = dirs.length > 0 ? dirs[0] : -1;
      }

      return selected;
    };

    // Q/E choose the previous/next marble that can leave
    var cycleSelection = function (step) {
      var dirs = launchableDirections();

      if (dirs.length === 0) {
        selected = -1;
        return;
      }

      var idx = dirs.indexOf(selected);

      if (idx === -1) {
        selected = dirs[0];
      } else {
        selected = dirs[(idx + step + dirs.length) % dirs.length];
      }
    };

    // Launch the marked marble, like clicking on it
    var launchSelected = function () {
      var dir = validSelection();

      if (dir !== -1) {
        launch(dir);
      }
    };

    var isPauseKey = function (e) {
      return e.code === "Escape" || e.code === "KeyP";
    };

    // ---- Menu navigation: arrows move the highlight, Enter selects ----

    var MENU_SCREENS = ["stat", "creds", "dbg", "sett", "abo", "lvl",
      "fail", "compl", "main"];

    var focused = null; // Highlighted menu item

    var isVisible = function (el) {
      return window.getComputedStyle(el).visibility === "visible";
    };

    var openScreen = function () {
      for (var i = 0; i < MENU_SCREENS.length; i++) {
        var screen = document.getElementById(MENU_SCREENS[i]);

        if (screen !== null && isVisible(screen)) {
          return screen;
        }
      }

      return null;
    };

    // Clickable items of the open screen, in page order. Items without
    // text (hidden easter eggs) and disabled ones are skipped.
    var menuItems = function (screen) {
      var items = [];
      var children = screen.children;

      for (var i = 0; i < children.length; i++) {
        var child = children[i];

        if (child.id === "grid") {
          var thumbs = child.querySelectorAll(".thumb:not(.locked)");

          for (var t = 0; t < thumbs.length; t++) {
            items.push(thumbs[t]);
          }
        } else if (isVisible(child) &&
          window.getComputedStyle(child).cursor === "pointer" &&
          child.textContent.replace(/ /g, "").trim() !== "") {
          items.push(child);
        }
      }

      return items;
    };

    var setFocus = function (el) {
      if (focused !== null) {
        focused.classList.remove("kbfocus");
      }

      focused = el;

      if (focused !== null) {
        focused.classList.add("kbfocus");

        if (focused.classList.contains("thumb")) {
          focused.scrollIntoView({block: "nearest"});
        }
      }
    };

    // Default item when a screen opens: the current level in the grid,
    // otherwise the first item
    var defaultItem = function (items) {
      for (var i = 0; i < items.length; i++) {
        if (items[i].classList.contains("current")) {
          return items[i];
        }
      }

      return items.length > 0 ? items[0] : null;
    };

    var gridColumns = function (thumbs) {
      var cols = 1;

      while (cols < thumbs.length &&
        thumbs[cols].offsetTop === thumbs[0].offsetTop) {
        cols++;
      }

      return cols;
    };

    var moveFocus = function (dir, items) {
      var idx = items.indexOf(focused);

      if (idx === -1) {
        setFocus(defaultItem(items));
        return;
      }

      var thumbs = items.filter(function (el) {
        return el.classList.contains("thumb");
      });
      var t = thumbs.indexOf(focused);

      // Up/down in the thumbnail grid move a whole row
      if (t !== -1 && (dir === UP || dir === DOWN)) {
        var cols = gridColumns(thumbs);
        var target = dir === UP ? t - cols : t + cols;

        if (target >= 0 && target < thumbs.length) {
          setFocus(thumbs[target]);
          return;
        }

        // Last row is not full: go to its last thumbnail
        var lastRow = Math.floor((thumbs.length - 1) / cols);
        if (dir === DOWN && Math.floor(t / cols) < lastRow) {
          setFocus(thumbs[thumbs.length - 1]);
          return;
        }

        // Leave the grid to the items above or below it
        if (dir === DOWN && t + cols >= thumbs.length) {
          var after = items.indexOf(thumbs[thumbs.length - 1]) + 1;
          if (after < items.length) {
            setFocus(items[after]);
          }
        } else if (dir === UP) {
          var before = items.indexOf(thumbs[0]) - 1;
          if (before >= 0) {
            setFocus(items[before]);
          }
        }

        return;
      }

      var step = (dir === UP || dir === LEFT) ? -1 : 1;
      var next = idx + step;

      if (next >= 0 && next < items.length) {
        setFocus(items[next]);
      }
    };

    var activate = function (el) {
      if (el.classList.contains("thumb")) {
        el.click();
      } else {
        // Menu items listen to mousedown or touchstart, see Menu
        el.dispatchEvent(new Event(orbium.has_touch_screen ?
          "touchstart" : "mousedown"));
      }
    };

    // Keep the highlight on the open screen, e.g. after it changed
    var syncFocus = function () {
      var screen = playing() ? null : openScreen();

      if (screen === null) {
        setFocus(null);
        return null;
      }

      var items = menuItems(screen);

      if (focused !== null && items.indexOf(focused) === -1) {
        setFocus(defaultItem(items));
      }

      return items;
    };

    var menuKey = function (e) {
      var items = syncFocus();

      if (items === null || items.length === 0) {
        return false;
      }

      if (arrowKeys[e.code] !== undefined) {
        moveFocus(arrowKeys[e.code], items);
        return true;
      }

      if (e.code === "Enter" || e.code === "NumpadEnter" ||
        e.code === "Space") {
        if (e.repeat) {
          return true;
        }

        if (focused === null) {
          setFocus(defaultItem(items));
        } else {
          activate(focused);

          // Highlight the first item of the screen that opened, if any
          var opened = syncFocus();
          if (opened !== null && focused === null) {
            setFocus(defaultItem(opened));
          }
        }

        return true;
      }

      return false;
    };

    this.keyDown = function (e) {
      if (!playing()) {
        // Esc goes back from submenus, Esc/P on the pause menu resumes
        if (e.code === "Escape" && !e.repeat && orbium.menu.back()) {
          syncFocus();
          e.preventDefault();
        } else if (isPauseKey(e) && !e.repeat && orbium.menu.canResume()) {
          orbium.menu.resume();
          setFocus(null);
          e.preventDefault();
        } else if (orbium.machine.loaded && menuKey(e)) {
          e.preventDefault();
        }

        return;
      }

      var handled = true;

      if (arrowKeys[e.code] !== undefined) {
        // Shift + arrow launches, plain arrow moves the cursor
        if (e.shiftKey) {
          if (!e.repeat) {
            launch(arrowKeys[e.code]);
          }
        } else {
          move(arrowKeys[e.code]);
        }
      } else if (launchKeys[e.code] !== undefined) {
        if (!e.repeat) {
          launch(launchKeys[e.code]);
        }
      } else if (e.code === "Space" || e.code === "Enter" ||
        e.code === "NumpadEnter") {
        if (!e.repeat) {
          rotate();
        }
      } else if (e.code === "KeyX" || e.code === "KeyF") {
        if (!e.repeat) {
          launchSelected();
        }
      } else if (e.code === "KeyQ" || e.code === "KeyE") {
        cycleSelection(e.code === "KeyE" ? 1 : -1);
      } else if (isPauseKey(e)) {
        orbium.menu.pause();

        // Paused from the keyboard: highlight RESUME right away
        var items = syncFocus();
        if (items !== null) {
          setFocus(defaultItem(items));
        }
      } else {
        handled = false;
      }

      if (handled) {
        active = true;
        e.preventDefault();
      }
    };

    // Mouse or touch use hides the keyboard cursor
    this.pointerUsed = function () {
      active = false;
    };

    // Called once per frame from the animation loop
    this.update = function () {
      if (active && playing()) {
        cursor0.style.left = "" +
          (orbium.xpos + cx * orbium.Tile.size) + "px";
        cursor0.style.top = "" +
          (orbium.ypos + orbium.Bar.height + cy * orbium.Tile.size) + "px";
        cursor0.style.visibility = "visible";

        // Green cursor when a marble is ready to leave this rotator, and a
        // ring with an arrow on the marble that X/F will launch
        var dir = validSelection();
        var pos = dir !== -1 ? rotatorUnderCursor().launchablePosition(dir) : null;

        cursor0.className = dir !== -1 ? "ready" : "";

        if (pos !== null) {
          var ring = Math.round(orbium.Marble.size * 1.5);
          var offset = Math.round((ring - orbium.Marble.size) / 2);

          launch0.style.left = "" + (orbium.xpos + pos.x - offset) + "px";
          launch0.style.top = "" + (orbium.ypos + pos.y - offset) + "px";
          launch0.className = "dir" + dir;
          arrow0.innerHTML = ARROWS[dir];
          launch0.style.visibility = "visible";
        } else {
          launch0.style.visibility = "hidden";
        }
      } else {
        cursor0.style.visibility = "hidden";
        launch0.style.visibility = "hidden";
      }
    };

    this.construct.apply(this, arguments);
  };
})(typeof window == "object" ? window.orbium = window.orbium || {} : orbium);
