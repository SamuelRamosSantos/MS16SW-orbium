(function (orbium, undefined) {
  orbium.Editor = function () {
    this.selected = null;

    var STORAGE_KEY = "custom_levels";
    var LEGACY_KEY = "custom_level";

    var textFactor = 3.0;

    var menu = null;

    var edt = null;
    var sav = null;
    var tst = null;
    var exp = null;
    var imp = null;
    var edb = null;
    var impfile = null;

    var edmeta = null;
    var edname = null;
    var edauthor = null;
    var edlane = null;
    var edclock = null;
    var edclr = null;
    var edmsg = null;

    var msgTimer = null;
    var editorAvailable = false;

    var stopEvent = function (e) {
      if (!e) {
        e = window.event;
      }
      e.cancelBubble = true;
      if (e.stopPropagation) {
        e.stopPropagation();
      }
    };

    var bindAction = function (el, handler) {
      if (!el) {
        return;
      }
      var evt = orbium.has_touch_screen ? "touchstart" : "mousedown";
      orbium.Util.attachListener(el, evt, function (e) {
        stopEvent(e);
        handler(e);
      });
    };

    var createBlankTiles = function () {
      var tiles = [];
      var total = orbium.Machine.horizTiles * orbium.Machine.vertTiles;
      for (var i = 0; i < total - 1; i++) {
        tiles.push("E00");
      }
      tiles.push("N00");
      return tiles;
    };

    var buildLevelArray = function (tiles, levnr, lane, clock) {
      var arr = tiles.slice(0, 40);
      arr[40] = levnr || 0;
      arr[41] = typeof lane === "number" ? lane : 20;
      arr[42] = typeof clock === "number" ? clock : 10;
      return arr;
    };

    // Garante que o pacote CUSTOM (packs[1]) exista com nome fixo "CUSTOM"
    // para nunca sobrepor o contador 01/01 na tela SELECT LVL
    var ensureCustomPack = function () {
      if (!orbium.packs[1]) {
        orbium.packs[1] = {
          id: orbium.Util.generateUniqeString(),
          name: "CUSTOM",
          level: [buildLevelArray(createBlankTiles(), 0, 20, 10)],
          meta: [{
            name: "CUSTOM 01",
            author: "PLAYER",
            createdAt: new Date().toISOString(),
            saved: false
          }]
        };
      } else {
        orbium.packs[1].name = "CUSTOM";
        if (!orbium.packs[1].meta) {
          orbium.packs[1].meta = [];
        }
      }

      for (var i = 0; i < orbium.packs[1].level.length; i++) {
        orbium.packs[1].level[i][40] = i;
        if (!orbium.packs[1].meta[i]) {
          orbium.packs[1].meta[i] = {
            name: "CUSTOM " + (i + 1 < 10 ? "0" + (i + 1) : i + 1),
            author: "PLAYER",
            createdAt: new Date().toISOString(),
            saved: false
          };
        }
      }
    };

    // Persiste todas as fases customizadas salvas no localStorage
    var persistCustomPack = function () {
      if (!orbium.storage || !orbium.packs[1]) {
        return;
      }

      var list = [];
      var levels = orbium.packs[1].level;
      var metas = orbium.packs[1].meta || [];

      for (var i = 0; i < levels.length; i++) {
        var lvl = levels[i];
        var m = metas[i] || {};
        list.push({
          format: "orbium-level",
          version: 1,
          name: m.name || ("CUSTOM " + (i + 1 < 10 ? "0" + (i + 1) : i + 1)),
          author: m.author || "PLAYER",
          createdAt: m.createdAt || new Date().toISOString(),
          dimensions: {
            cols: orbium.Machine.horizTiles,
            rows: orbium.Machine.vertTiles
          },
          matrix: orbium.Util.buildTileMatrix(
            lvl.slice(0, 40),
            orbium.Machine.horizTiles,
            orbium.Machine.vertTiles
          ),
          tiles: lvl.slice(0, 40),
          timeLimits: {
            lane: typeof lvl[41] === "number" ? lvl[41] : 20,
            clock: typeof lvl[42] === "number" ? lvl[42] : 10
          }
        });
      }

      orbium.storage.writeValue(STORAGE_KEY, JSON.stringify(list));
      // Remove chave antiga caso exista de versão anterior
      orbium.storage.deleteValue(LEGACY_KEY);
    };

    // Restaura fases customizadas salvas no localStorage sem substituir
    // o pacote DEFAULT (mantém as 99 fases originais intactas ao abrir o jogo)
    var restoreSavedLevels = function () {
      if (!orbium.storage) {
        return false;
      }

      var entries = [];
      var rawList = orbium.storage.readValue(STORAGE_KEY);
      if (rawList) {
        try {
          var parsedList = JSON.parse(rawList);
          if (Array.isArray(parsedList)) {
            for (var i = 0; i < parsedList.length; i++) {
              var res = orbium.Util.validateLevelJson(
                JSON.stringify(parsedList[i])
              );
              if (res.valid) {
                entries.push(res.data);
              }
            }
          }
        } catch (e) {
          // Ignora lista corrompida
        }
      }

      if (entries.length === 0) {
        var rawSingle = orbium.storage.readValue(LEGACY_KEY);
        if (rawSingle) {
          var singleRes = orbium.Util.validateLevelJson(rawSingle);
          if (singleRes.valid) {
            entries.push(singleRes.data);
          }
        }
      }

      if (entries.length === 0) {
        return false;
      }

      var levelArr = [];
      var metaArr = [];

      for (var j = 0; j < entries.length; j++) {
        var item = entries[j];
        levelArr.push(
          buildLevelArray(
            item.tiles,
            j,
            item.timeLimits.lane,
            item.timeLimits.clock
          )
        );
        metaArr.push({
          name: item.name,
          author: item.author,
          createdAt: item.createdAt,
          saved: true
        });
      }

      orbium.packs[1] = {
        id: orbium.Util.generateUniqeString(),
        name: "CUSTOM",
        level: levelArr,
        meta: metaArr
      };

      editorAvailable = true;
      return true;
    };

    // Ativa o pacote CUSTOM (pack_idx = 1) para edição sem tocar no pacote DEFAULT
    var activateCustomPack = function (targetLevnr) {
      ensureCustomPack();
      editorAvailable = true;
      orbium.Machine.editorMode = true;

      var switchingFromDefault = (orbium.pack_idx !== 1);
      orbium.pack_idx = 1;
      orbium.level = orbium.packs[1].level;

      var idx = typeof targetLevnr === "number" ?
        targetLevnr : (switchingFromDefault ? 0 : orbium.machine.levnr);

      if (idx < 0 || idx >= orbium.level.length) {
        idx = 0;
      }

      orbium.machine.gotoLevel(idx);
      if (orbium.machine.counter === null) {
        orbium.machine.counter = new orbium.Counter(-1, -1, -1);
      }
    };

    var patchMenuForCustomPack = function () {
      if (!orbium.menu) {
        return;
      }

      var packEl = document.getElementById("pack");
      var editEl = document.getElementById("edit");

      // Quando o editor é ativado no menu de debug, cria/restaura o pacote CUSTOM
      // sem substituir o pacote DEFAULT de 99 fases originais
      orbium.menu.editoron = function () {
        editorAvailable = true;
        if (!restoreSavedLevels()) {
          ensureCustomPack();
        }
        orbium.packs[1].name = "CUSTOM";
        orbium.Machine.editorMode = (orbium.pack_idx === 1);

        orbium.menu.hideDbg();
        orbium.menu.updateStart();
        orbium.menu.showMain();
      };

      // Ao abrir SELECT LVL, preserva o bloqueio normal das fases DEFAULT
      // enquanto exibe os botões LEVELS e EDIT caso haja fases customizadas
      var origShowLvl = orbium.menu.showLvl;
      orbium.menu.showLvl = function () {
        orbium.Machine.editorMode = (orbium.pack_idx === 1);
        origShowLvl.apply(orbium.menu, arguments);

        if (editorAvailable) {
          if (packEl) {
            packEl.style.visibility = "visible";
          }
          if (editEl) {
            editEl.style.visibility = "visible";
          }
        }
      };

      // Ao alternar entre LEVELS: DEFAULT e LEVELS: CUSTOM em SELECT LVL
      var origChangePack = orbium.menu.changePack;
      orbium.menu.changePack = function () {
        var nextIdx = (orbium.pack_idx < orbium.packs.length - 1) ?
          orbium.pack_idx + 1 : 0;

        orbium.Machine.editorMode = (nextIdx === 1);

        if (nextIdx === 0 && orbium.storage) {
          var lastDefault = orbium.storage.readInt(
            "lastlevel",
            0,
            orbium.packs[0].level.length - 1
          );
          orbium.machine.levnr = lastDefault !== null ? lastDefault : 0;
        } else if (nextIdx === 1) {
          orbium.machine.levnr = 0;
        }

        origChangePack.apply(orbium.menu, arguments);
      };
    };

    this.construct = function () {
      this.selected = null;

      menu = document.getElementById("menu");

      edt = document.getElementById("edt");
      sav = document.getElementById("sav");
      tst = document.getElementById("tst");
      exp = document.getElementById("exp");
      imp = document.getElementById("imp");
      edb = document.getElementById("edb");
      impfile = document.getElementById("impfile");

      edmeta = document.getElementById("edmeta");
      edname = document.getElementById("edname");
      edauthor = document.getElementById("edauthor");
      edlane = document.getElementById("edlane");
      edclock = document.getElementById("edclock");
      edclr = document.getElementById("edclr");
      edmsg = document.getElementById("edmsg");

      var fontSize = Math.round(orbium.Tile.size / textFactor);

      sav.style.fontSize = "" + fontSize + "px";
      tst.style.fontSize = "" + fontSize + "px";
      if (exp) {
        exp.style.fontSize = "" + fontSize + "px";
      }
      if (imp) {
        imp.style.fontSize = "" + fontSize + "px";
      }
      if (edb) {
        edb.style.fontSize = "" + fontSize + "px";
      }

      bindAction(sav, function () {
        that.save();
      });
      bindAction(tst, function () {
        that.test();
      });
      bindAction(exp, function () {
        that.exportLevel();
      });
      bindAction(imp, function () {
        that.triggerImport();
      });
      bindAction(edb, function () {
        that.back();
      });
      bindAction(edclr, function () {
        that.clearBoard();
      });

      if (impfile) {
        orbium.Util.attachListener(impfile, "change", function (e) {
          stopEvent(e);
          var file = e.target && e.target.files ? e.target.files[0] : null;
          if (file) {
            that.importFile(file);
          }
        });
      }

      if (edmsg) {
        bindAction(edmsg, function () {
          that.hideMessage();
        });
      }

      // Evita que cliques ou teclas nos campos de metadados afetem o canvas
      var inputs = [edname, edauthor, edlane, edclock];
      for (var n = 0; n < inputs.length; n++) {
        if (inputs[n]) {
          orbium.Util.attachListener(inputs[n], "mousedown", stopEvent);
          orbium.Util.attachListener(inputs[n], "touchstart", stopEvent);
          orbium.Util.attachListener(inputs[n], "keydown", stopEvent);
          orbium.Util.attachListener(inputs[n], "change", function () {
            that.syncToActiveLevel();
          });
        }
      }

      // Permite usar a tecla Esc para voltar à paleta do editor ou sair para SELECT LVL
      orbium.Util.attachListener(window, "keydown", function (e) {
        if (e.code === "Escape" && !e.repeat) {
          if (edt && edt.style.visibility === "visible") {
            stopEvent(e);
            if (e.preventDefault) {
              e.preventDefault();
            }
            that.back();
          } else if (orbium.Machine.editorMode && that.haveSelected()) {
            stopEvent(e);
            if (e.preventDefault) {
              e.preventDefault();
            }
            that.selected = null;
            that.showEdit();
          }
        }
      });

      patchMenuForCustomPack();

      var components = [
        ["E00", "emptytile0", ""],
        ["R00", "rotatile14", "rotator0"],
        ["H00", "horiztile0", ""],
        ["V00", "verttile0", ""],
        ["X00", "crosstile0", ""],
        ["N00", "counter0", ""],
        ["I10", "modtile13", "inspector0"],
        ["I00", "modtile12", "inspector0"],
        ["I20", "modtile14", "inspector0"],
        ["P10", "modtile13", "teleporter1"],
        ["P00", "modtile12", "teleporter0"],
        ["P20", "modtile14", "teleporter2"],
        ["T10", "modtile13", "transformer0"],
        ["T00", "modtile12", "transformer0"],
        ["T20", "modtile14", "transformer0"],
        ["C00", "clock0", ""],
        ["M00", "matcher0", ""],
        ["S00", "sequencer0", ""],
        ["D00", "modtile4", "director0"],
        ["D10", "modtile5", "director1"],
        ["D20", "modtile6", "director2"],
        ["D30", "modtile7", "director3"],
        ["F00", "verttile0", ""],
        ["A00", "announcer0", ""]
      ];

      var offset = orbium.Tile.size / 8;
      var x = 0;
      var y = 0;

      for (var i = 0, j = components.length; i < j; i++) {
        var type = components[i][0];

        var xp = offset + x * orbium.Tile.size;
        var yp = offset + y * orbium.Tile.size;

        var tile = document.createElement("div");
        tile.id = "base_" + type;
        tile.style.left = "" + xp + "px";
        tile.style.top = "" + yp + "px";
        tile.style.position = "absolute";
        tile.style.padding = "0px";
        tile.style.margin = "0px";
        tile.style.backgroundRepeat = "no-repeat";
        tile.style.width = orbium.Tile.size + "px";
        tile.style.height = orbium.Tile.size + "px";
        tile.style.zIndex = "100";
        tile.style.backgroundImage = "url(" +
          orbium.gfx_path + components[i][1] + ".png)";
        edt.appendChild(tile);

        var overlay = document.createElement("div");
        overlay.id = "" + type;
        overlay.style.left = "" + xp + "px";
        overlay.style.top = "" + yp + "px";
        overlay.style.position = "absolute";
        overlay.style.padding = "0px";
        overlay.style.margin = "0px";
        overlay.style.backgroundRepeat = "no-repeat";
        overlay.style.width = orbium.Tile.size + "px";
        overlay.style.height = orbium.Tile.size + "px";
        overlay.style.zIndex = "101";
        if (components[i][2] !== "") {
          overlay.style.backgroundImage = "url(" +
            orbium.gfx_path + components[i][2] + ".png)";
        }
        overlay.style.cursor = "pointer";

        edt.appendChild(overlay);

        var ol = document.getElementById("" + type);
        if (orbium.has_touch_screen) {
          orbium.Util.attachListener(ol, "touchstart", function (e) {
            orbium.editor.place(e);
          });
        } else {
          orbium.Util.attachListener(ol, "mousedown", function (e) {
            orbium.editor.place(e);
          });
        }

        if (x === 5) {
          x = 0;
          y++;
        } else {
          x++;
        }
      }

      // Carrega o pacote CUSTOM em segundo plano se houver fases salvas,
      // mantendo o jogo iniciar normalmente no pacote DEFAULT
      restoreSavedLevels();
    };

    // Exibe mensagem visual amigável de confirmação ou de erro de validação
    this.showMessage = function (text, isError) {
      if (!edmsg) {
        return;
      }

      if (msgTimer !== null) {
        clearTimeout(msgTimer);
        msgTimer = null;
      }

      edmsg.innerHTML = text;
      edmsg.className = isError ? "err" : "ok";
      edmsg.style.visibility = "visible";

      msgTimer = setTimeout(function () {
        that.hideMessage();
      }, 4500);
    };

    this.hideMessage = function () {
      if (msgTimer !== null) {
        clearTimeout(msgTimer);
        msgTimer = null;
      }

      if (edmsg) {
        edmsg.style.visibility = "hidden";
      }
    };

    var getActiveLevelIndex = function () {
      if (orbium.machine && orbium.machine.levnr >= 0 &&
        orbium.level && orbium.machine.levnr < orbium.level.length) {
        return orbium.machine.levnr;
      }
      return 0;
    };

    // Coleta os 40 códigos de tiles atualmente ativos na grade de machine.js
    this.getActiveTiles = function () {
      var total = orbium.Machine.horizTiles * orbium.Machine.vertTiles;
      var levnr = getActiveLevelIndex();
      var currentEntry = (orbium.level && orbium.level[levnr]) ?
        orbium.level[levnr] : [];
      var tiles = [];

      for (var i = 0; i < total; i++) {
        var liveTile = (orbium.machine && orbium.machine.tiles) ?
          orbium.machine.tiles[i] : null;
        var fallback = currentEntry[i] || "E00";
        tiles.push(orbium.Util.getTileSymbol(liveTile, fallback));
      }

      return tiles;
    };

    // Lê e higieniza os metadados e limites de tempo configurados no editor
    this.getMetadata = function () {
      ensureCustomPack();
      var levnr = getActiveLevelIndex();
      var total = orbium.Machine.horizTiles * orbium.Machine.vertTiles;
      var currentEntry = (orbium.packs[1].level[levnr]) ?
        orbium.packs[1].level[levnr] : [];
      var currentMeta = (orbium.packs[1].meta[levnr]) ?
        orbium.packs[1].meta[levnr] : {};

      var defaultLane = typeof currentEntry[total + 1] === "number" ?
        currentEntry[total + 1] : 20;
      var defaultClock = typeof currentEntry[total + 2] === "number" ?
        currentEntry[total + 2] : 10;

      var name = (edname && edname.value.trim() !== "") ?
        edname.value.trim() : (currentMeta.name || "CUSTOM 01");
      var author = (edauthor && edauthor.value.trim() !== "") ?
        edauthor.value.trim() : (currentMeta.author || "PLAYER");

      var laneVal = edlane ? parseInt(edlane.value, 10) : defaultLane;
      if (isNaN(laneVal) || laneVal < 1) {
        laneVal = defaultLane;
      } else if (laneVal > 999) {
        laneVal = 999;
      }

      var clockVal = edclock ? parseInt(edclock.value, 10) : defaultClock;
      if (isNaN(clockVal) || clockVal < 1) {
        clockVal = defaultClock;
      } else if (clockVal > 999) {
        clockVal = 999;
      }

      return {
        name: name,
        author: author,
        createdAt: currentMeta.createdAt || new Date().toISOString(),
        lane: laneVal,
        clock: clockVal
      };
    };

    // Atualiza os campos visuais do painel lateral com os dados da fase customizada ativa
    var refreshMetadataInputs = function () {
      ensureCustomPack();
      var levnr = getActiveLevelIndex();
      var total = orbium.Machine.horizTiles * orbium.Machine.vertTiles;
      var currentEntry = orbium.packs[1].level[levnr] || [];
      var currentMeta = orbium.packs[1].meta[levnr] || {};

      if (edname) {
        edname.value = currentMeta.name ||
          ("CUSTOM " + (levnr + 1 < 10 ? "0" + (levnr + 1) : levnr + 1));
      }
      if (edauthor) {
        edauthor.value = currentMeta.author || "PLAYER";
      }
      if (edlane && typeof currentEntry[total + 1] === "number") {
        edlane.value = currentEntry[total + 1];
      }
      if (edclock && typeof currentEntry[total + 2] === "number") {
        edclock.value = currentEntry[total + 2];
      }
    };

    // Sincroniza a matriz de peças e limites de tempo exclusivamente no pacote CUSTOM
    this.syncToActiveLevel = function () {
      if (orbium.pack_idx !== 1) {
        return;
      }

      ensureCustomPack();
      var levnr = getActiveLevelIndex();
      var total = orbium.Machine.horizTiles * orbium.Machine.vertTiles;
      var tiles = this.getActiveTiles();
      var meta = this.getMetadata();

      if (!orbium.packs[1].level[levnr]) {
        orbium.packs[1].level[levnr] = [];
      }

      for (var i = 0; i < total; i++) {
        orbium.packs[1].level[levnr][i] = tiles[i];
      }

      orbium.packs[1].level[levnr][total] = levnr;
      orbium.packs[1].level[levnr][total + 1] = meta.lane;
      orbium.packs[1].level[levnr][total + 2] = meta.clock;

      var prevSaved = orbium.packs[1].meta[levnr] ?
        !!orbium.packs[1].meta[levnr].saved : false;

      orbium.packs[1].meta[levnr] = {
        name: meta.name,
        author: meta.author,
        createdAt: meta.createdAt,
        saved: prevSaved
      };
      orbium.packs[1].name = "CUSTOM";
    };

    // Salva a fase no pacote CUSTOM (cria novo slot se mudou o nome de uma fase já salva)
    this.save = function () {
      if (orbium.pack_idx !== 1) {
        activateCustomPack(0);
      }

      ensureCustomPack();
      var tiles = this.getActiveTiles();
      var meta = this.getMetadata();
      var levnr = getActiveLevelIndex();
      var currentMeta = orbium.packs[1].meta[levnr] || {};

      // Verifica se já existe uma fase com o mesmo nome no pacote CUSTOM
      var existingIdx = -1;
      for (var i = 0; i < orbium.packs[1].meta.length; i++) {
        if (orbium.packs[1].meta[i] &&
          orbium.packs[1].meta[i].name.toUpperCase() ===
            meta.name.toUpperCase()) {
          existingIdx = i;
          break;
        }
      }

      var targetIdx = levnr;
      if (existingIdx !== -1) {
        targetIdx = existingIdx;
      } else if (currentMeta.saved &&
        currentMeta.name &&
        currentMeta.name.toUpperCase() !== meta.name.toUpperCase()) {
        // Nome diferente de uma fase já salva: adiciona como nova fase em CUSTOM
        targetIdx = orbium.packs[1].level.length;
      }

      orbium.packs[1].level[targetIdx] = buildLevelArray(
        tiles,
        targetIdx,
        meta.lane,
        meta.clock
      );
      orbium.packs[1].meta[targetIdx] = {
        name: meta.name,
        author: meta.author,
        createdAt: new Date().toISOString(),
        saved: true
      };
      orbium.packs[1].id = orbium.Util.generateUniqeString();
      orbium.packs[1].name = "CUSTOM";

      orbium.level = orbium.packs[1].level;
      orbium.machine.levnr = targetIdx;

      persistCustomPack();

      var slotLabel = (targetIdx + 1 < 10 ? "0" : "") + (targetIdx + 1);
      this.showMessage(
        "FASE SALVA EM LEVELS: CUSTOM (#" + slotLabel + " - " + meta.name + ")",
        false
      );
    };

    // Limpa o tabuleiro para uma fase em branco (39 E00 + N00)
    this.clearBoard = function () {
      if (orbium.pack_idx !== 1) {
        activateCustomPack(0);
      }

      ensureCustomPack();
      var levnr = getActiveLevelIndex();
      var nextNum = orbium.packs[1].level.length + 1;
      var currentMeta = orbium.packs[1].meta[levnr] || {};
      var newName = currentMeta.saved ?
        ("CUSTOM " + (nextNum < 10 ? "0" + nextNum : nextNum)) :
        (currentMeta.name || "CUSTOM 01");

      this.applyImportedLevel({
        name: newName,
        author: currentMeta.author || "PLAYER",
        createdAt: new Date().toISOString(),
        tiles: createBlankTiles(),
        timeLimits: {
          lane: 20,
          clock: 10
        }
      });

      this.showMessage("TABULEIRO LIMPO COM SUCESSO", false);
    };

    // Sai do editor e retorna para a tela de seleção de fases (SELECT LVL)
    this.back = function () {
      this.selected = null;
      this.syncToActiveLevel();
      this.hideEdit();
      orbium.menu.showLvl();
    };

    // Inicia o teste da fase personalizada garantindo limites de tempo atualizados
    this.test = function () {
      this.hideMessage();
      this.syncToActiveLevel();
      orbium.machine.resetLevel();

      if (orbium.machine.counter === null) {
        orbium.machine.counter = new orbium.Counter(-1, -1, -1);
      }

      orbium.menu.start();
    };

    // Exporta a fase ativa em arquivo .json estruturado via Blob e URL temporária
    this.exportLevel = function () {
      this.syncToActiveLevel();

      var nowIso = new Date().toISOString();
      var meta = this.getMetadata();
      var tiles = this.getActiveTiles();

      var validation = orbium.Util.validateLevelJson(
        orbium.Util.serializeLevelData(meta, tiles, {
          lane: meta.lane,
          clock: meta.clock
        })
      );

      if (!validation.valid) {
        this.showMessage("ERRO AO EXPORTAR: " + validation.error, true);
        return false;
      }

      var jsonString = orbium.Util.serializeLevelData(
        {
          name: meta.name,
          author: meta.author,
          createdAt: nowIso
        },
        tiles,
        {
          lane: meta.lane,
          clock: meta.clock
        }
      );

      var ok = orbium.Util.downloadJsonFile(jsonString, meta.name);
      if (ok) {
        this.showMessage("FASE EXPORTADA COM SUCESSO: " + meta.name, false);
      } else {
        this.showMessage("ERRO: DOWNLOAD NAO SUPORTADO NO NAVEGADOR", true);
      }

      return ok;
    };

    // Abre o seletor de arquivo .json para importação
    this.triggerImport = function () {
      if (!impfile) {
        return;
      }
      impfile.value = "";
      impfile.click();
    };

    // Lê o arquivo enviado via FileReader e encaminha para validação e injeção
    this.importFile = function (file) {
      if (!file) {
        this.showMessage("ERRO: NENHUM ARQUIVO SELECIONADO", true);
        return;
      }

      if (file.name && !/\.json$/i.test(file.name) &&
        file.type && file.type.indexOf("json") === -1) {
        this.showMessage("ERRO: FORMATO INCOMPATIVEL (USE ARQUIVO .JSON)", true);
        return;
      }

      if (typeof FileReader === "undefined") {
        this.showMessage("ERRO: FILEREADER NAO SUPORTADO", true);
        return;
      }

      var reader = new FileReader();

      reader.onload = function (evt) {
        var content = evt && evt.target ? evt.target.result : reader.result;
        that.importJson(content);
      };

      reader.onerror = function () {
        that.showMessage("ERRO: FALHA AO LER O ARQUIVO ENVIADO", true);
      };

      reader.readAsText(file, "UTF-8");
    };

    // Valida sintática e semanticamente o JSON e injeta os 40 tiles em machine.js
    this.importJson = function (rawText) {
      var result = orbium.Util.validateLevelJson(rawText);

      if (!result.valid) {
        this.showMessage("ERRO: " + result.error, true);
        return false;
      }

      this.applyImportedLevel(result.data);
      this.showMessage(
        "FASE IMPORTADA COM SUCESSO: " + result.data.name,
        false
      );
      return true;
    };

    // Injeta os 40 tiles validados e limites de tempo na grade de machine.js
    this.applyImportedLevel = function (levelData) {
      ensureCustomPack();
      editorAvailable = true;
      orbium.Machine.editorMode = true;
      orbium.pack_idx = 1;
      orbium.level = orbium.packs[1].level;

      var levnr = getActiveLevelIndex();

      orbium.packs[1].id = orbium.Util.generateUniqeString();
      orbium.packs[1].name = "CUSTOM";
      orbium.packs[1].level[levnr] = buildLevelArray(
        levelData.tiles,
        levnr,
        levelData.timeLimits.lane,
        levelData.timeLimits.clock
      );
      orbium.packs[1].meta[levnr] = {
        name: levelData.name || "CUSTOM 01",
        author: levelData.author || "PLAYER",
        createdAt: levelData.createdAt || new Date().toISOString(),
        saved: false
      };

      if (edname) {
        edname.value = levelData.name;
      }
      if (edauthor) {
        edauthor.value = levelData.author;
      }
      if (edlane) {
        edlane.value = levelData.timeLimits.lane;
      }
      if (edclock) {
        edclock.value = levelData.timeLimits.clock;
      }

      // Reconstrói as 40 instâncias de Tile, bases e calha em machine.js
      orbium.machine.levnr = levnr;
      orbium.machine.resetLevel();

      if (orbium.machine.counter === null) {
        orbium.machine.counter = new orbium.Counter(-1, -1, -1);
      }
    };

    this.showEdit = function () {
      if (orbium.pack_idx !== 1) {
        activateCustomPack(0);
      }

      refreshMetadataInputs();

      menu.style.visibility = "visible";
      menu.style.opacity = "1.0";
      menu.style.filter = "alpha(opacity=100)";

      edt.style.visibility = "visible";
      sav.style.visibility = "visible";
      tst.style.visibility = "visible";
      if (exp) {
        exp.style.visibility = "visible";
      }
      if (imp) {
        imp.style.visibility = "visible";
      }
      if (edb) {
        edb.style.visibility = "visible";
      }

      var offset = orbium.Tile.size / 8;
      var yp = offset + 4 * orbium.Tile.size;

      sav.style.left = "4%";
      sav.style.top = "" + yp + "px";

      tst.style.left = "21%";
      tst.style.top = "" + yp + "px";

      if (exp) {
        exp.style.left = "38%";
        exp.style.top = "" + yp + "px";
      }

      if (imp) {
        imp.style.left = "61%";
        imp.style.top = "" + yp + "px";
      }

      if (edb) {
        edb.style.left = "83%";
        edb.style.top = "" + yp + "px";
      }

      if (edmeta) {
        var metaLeft = Math.round(offset * 1.8 + 6 * orbium.Tile.size);
        var menuWidth = orbium.width - orbium.Marble.size * 2;
        var metaWidth = Math.max(90, menuWidth - metaLeft - Math.round(offset));
        var labelFont = Math.max(11, Math.round(orbium.Tile.size / 8));
        var inputFont = Math.max(12, Math.round(orbium.Tile.size / 7));

        edmeta.style.left = "" + metaLeft + "px";
        edmeta.style.top = "" + Math.round(offset) + "px";
        edmeta.style.width = "" + metaWidth + "px";
        edmeta.style.fontSize = "" + labelFont + "px";
        edmeta.style.visibility = "visible";

        var inputs = edmeta.getElementsByTagName("input");
        for (var i = 0; i < inputs.length; i++) {
          inputs[i].style.fontSize = "" + inputFont + "px";
        }
        if (edclr) {
          edclr.style.fontSize = "" + inputFont + "px";
        }
      }

      if (edmsg) {
        var msgFont = Math.max(14, Math.round(orbium.Tile.size / 5.2));
        edmsg.style.top = "" + Math.round(yp - orbium.Tile.size * 0.55) + "px";
        edmsg.style.fontSize = "" + msgFont + "px";
      }
    };

    this.hideEdit = function () {
      this.hideMessage();

      edt.style.visibility = "hidden";
      sav.style.visibility = "hidden";
      tst.style.visibility = "hidden";
      if (exp) {
        exp.style.visibility = "hidden";
      }
      if (imp) {
        imp.style.visibility = "hidden";
      }
      if (edb) {
        edb.style.visibility = "hidden";
      }
      if (edmeta) {
        edmeta.style.visibility = "hidden";
      }
    };

    this.edit = function () {
      orbium.menu.hideLvl();
      if (orbium.pack_idx !== 1) {
        activateCustomPack(0);
      } else {
        orbium.Machine.editorMode = true;
      }
      this.showEdit();
    };

    this.place = function (e) {
      if (!e) {
        e = window.event;
      }
      e.cancelBubble = true;
      if (e.stopPropagation) {
        e.stopPropagation();
      }

      var type = null;

      if (e.touches && e.touches.length) {
        type = e.touches[0].target.id;
      } else if (e.target) {
        type = e.target.id;
      } else if (e.srcElement) {
        type = e.srcElement.id;
      }

      orbium.menu.hideMain();
      this.hideEdit();

      this.selected = type;
    };

    this.haveSelected = function () {
      return !!this.selected;
    };

    var that = this;
    this.construct.apply(this, arguments);
  };
})(typeof window == "object" ? window.orbium = window.orbium || {} : orbium);
