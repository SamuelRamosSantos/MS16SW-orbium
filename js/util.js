(function (orbium, undefined) {
  orbium.Util = {};

  // Expressão regular com todos os códigos de peças (tiles) válidos do Orbium
  var VALID_TILE_REGEX =
    /^(E00|R00|H00|V00|X00|N00|C00|M00|F00|A00|I[0-2][0-5]|P[0-2]0|T[0-2][0-5]|D[0-3]0|S0[0-3])$/;

  orbium.Util.withinRect = function (xchk, ychk, xpos, ypos, width, height) {
    if (xchk >= xpos && xchk <= xpos + width) {
      if (ychk >= ypos && ychk <= ypos + height) {
        return true;
      }
    }

    return false;
  };

  orbium.Util.addArrayElement = function (array, element) {
    array.push(element);
  };

  orbium.Util.setArrayElement = function (idx, array, element) {
    array[idx] = element;

    // Mantém o array do nível customizado sincronizado ao posicionar peças no editor,
    // sem nunca alterar o pacote de fases originais (pack_idx === 0)
    if (orbium.machine && array === orbium.machine.tiles &&
      orbium.editor && orbium.editor.haveSelected() &&
      orbium.pack_idx === 1 &&
      orbium.level && orbium.level[orbium.machine.levnr]) {
      var selected = orbium.editor.selected;
      if (element) {
        element.symbol = selected;
      }
      orbium.level[orbium.machine.levnr][idx] = selected;
    }
  };

  orbium.Util.removeArrayElement = function (array, element) {
    for (var i = 0, j = array.length; i < j; i++) {
      if (array[i] === element) {
        array.splice(i, 1);
        return;
      }
    }
  };

  orbium.Util.generateRandomIndex = function (max) {
    var rand = Math.random();

    for (var i = 0; i < max; i++) {
      if (rand < (i + 1) / (max + 1)) {
        return i;
      }
    }

    return max;
  };

  orbium.Util.generateUniqeString = function () {
    var allowed = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
      "abcdefghijklmnopqrstuvwxyz";

    var chars = allowed.split("");

    var arr = [];

    for (var i = 0; i < 6; i++) {
      arr[i] = chars[0 | Math.random() * chars.length];
    }

    return arr.join("");
  };

  orbium.Util.attachListener = function (element, event, func) {
    element.addEventListener(event, func, true);
  };

  orbium.Util.detachListener = function (element, event, func) {
    element.removeEventListener(event, func, true);
  };

  orbium.Util.getRequestParameter = function (name) {
    function getRequestParameters() {
      var result = {};
      var url = window.location.href;
      var parameters = url.slice(url.indexOf("?") + 1).split("&");

      for (var i = 0, j = parameters.length; i < j; i++) {
        var parameter = parameters[i].split("=");

        result[parameter[0]] = parameter[1];
      }

      return result;
    }

    return getRequestParameters()[name];
  };

  // Verifica se o código de uma peça pertence ao conjunto de tiles válidos
  orbium.Util.isValidTileSymbol = function (symbol) {
    return typeof symbol === "string" && VALID_TILE_REGEX.test(symbol);
  };

  var findImageIndex = function (img, prefix, maxIdx) {
    if (!img || !orbium.loader) {
      return 0;
    }

    for (var i = 0; i <= maxIdx; i++) {
      if (orbium.loader[prefix + i] === img) {
        return i;
      }
    }

    return 0;
  };

  // Obtém o código de 3 caracteres correspondente a uma instância de Tile
  orbium.Util.getTileSymbol = function (tile, fallback) {
    if (tile && orbium.Util.isValidTileSymbol(tile.symbol)) {
      return tile.symbol;
    }

    if (!tile) {
      return orbium.Util.isValidTileSymbol(fallback) ? fallback : "E00";
    }

    if (orbium.EmptyTile && tile instanceof orbium.EmptyTile) {
      return "E00";
    }
    if (orbium.Rotator && tile instanceof orbium.Rotator) {
      return "R00";
    }
    if (orbium.HorizTile && tile instanceof orbium.HorizTile) {
      return "H00";
    }
    if (orbium.FallTile && tile instanceof orbium.FallTile) {
      return "F00";
    }
    if (orbium.VertTile && tile instanceof orbium.VertTile) {
      return "V00";
    }
    if (orbium.CrossTile && tile instanceof orbium.CrossTile) {
      return "X00";
    }
    if (orbium.Counter && tile instanceof orbium.Counter) {
      return "N00";
    }
    if (orbium.Clock && tile instanceof orbium.Clock) {
      return "C00";
    }
    if (orbium.Matcher && tile instanceof orbium.Matcher) {
      return "M00";
    }
    if (orbium.Announcer && tile instanceof orbium.Announcer) {
      return "A00";
    }
    if (orbium.Teleporter && tile instanceof orbium.Teleporter) {
      var pVar = typeof tile.variant === "number" ? tile.variant : 0;
      return "P" + pVar + "0";
    }
    if (orbium.Inspector && tile instanceof orbium.Inspector) {
      var iVar = typeof tile.variant === "number" ? tile.variant : 0;
      var iCol = tile.images ?
        findImageIndex(tile.images[2], "inspector", 5) : 0;
      return "I" + iVar + iCol;
    }
    if (orbium.Transformer && tile instanceof orbium.Transformer) {
      var tVar = typeof tile.variant === "number" ? tile.variant : 0;
      var tCol = tile.images ?
        findImageIndex(tile.images[2], "transformer", 5) : 0;
      return "T" + tVar + tCol;
    }
    if (orbium.Director && tile instanceof orbium.Director) {
      var dDir = tile.images ?
        findImageIndex(tile.images[2], "director", 3) : 0;
      return "D" + dDir + "0";
    }
    if (orbium.Sequencer && tile instanceof orbium.Sequencer) {
      if (typeof fallback === "string" && /^S0[0-3]$/.test(fallback)) {
        return fallback;
      }
      for (var c = 0; c <= 3; c++) {
        if (tile.matches && tile.matches(c)) {
          return "S0" + c;
        }
      }
      return "S00";
    }

    return orbium.Util.isValidTileSymbol(fallback) ? fallback : "E00";
  };

  // Converte a lista plana de 40 peças em uma matriz 8x5 (5 linhas x 8 colunas)
  orbium.Util.buildTileMatrix = function (tiles, cols, rows) {
    var numCols = cols || (orbium.Machine ? orbium.Machine.horizTiles : 8);
    var numRows = rows || (orbium.Machine ? orbium.Machine.vertTiles : 5);
    var matrix = [];

    for (var r = 0; r < numRows; r++) {
      var row = [];
      for (var c = 0; c < numCols; c++) {
        row.push(tiles[r * numCols + c]);
      }
      matrix.push(row);
    }

    return matrix;
  };

  // Serializa os dados do nível ativo em uma estrutura JSON com metadados
  orbium.Util.serializeLevelData = function (meta, tiles, timeLimits) {
    var cols = orbium.Machine ? orbium.Machine.horizTiles : 8;
    var rows = orbium.Machine ? orbium.Machine.vertTiles : 5;

    var name = (meta && typeof meta.name === "string" &&
      meta.name.trim() !== "") ? meta.name.trim() : "CUSTOM 01";
    var author = (meta && typeof meta.author === "string" &&
      meta.author.trim() !== "") ? meta.author.trim() : "PLAYER";
    var createdAt = (meta && meta.createdAt) ?
      meta.createdAt : new Date().toISOString();

    var lane = (timeLimits && typeof timeLimits.lane === "number") ?
      timeLimits.lane : 20;
    var clock = (timeLimits && typeof timeLimits.clock === "number") ?
      timeLimits.clock : 10;

    var payload = {
      format: "orbium-level",
      version: 1,
      name: name,
      author: author,
      createdAt: createdAt,
      dimensions: {
        cols: cols,
        rows: rows
      },
      matrix: orbium.Util.buildTileMatrix(tiles, cols, rows),
      tiles: tiles.slice(0, cols * rows),
      timeLimits: {
        lane: lane,
        clock: clock
      }
    };

    return JSON.stringify(payload, null, 2);
  };

  var parsePositiveInt = function (val, defaultVal) {
    if (val === undefined || val === null) {
      return defaultVal;
    }
    if (typeof val === "number" && isFinite(val) &&
      Math.floor(val) === val && val >= 1 && val <= 999) {
      return val;
    }
    if (typeof val === "string" && /^\d+$/.test(val.trim())) {
      var parsed = parseInt(val.trim(), 10);
      if (parsed >= 1 && parsed <= 999) {
        return parsed;
      }
    }
    return null;
  };

  // Achata uma matriz 2D (5x8 ou 8x5) de peças em um vetor de 40 posições
  var flattenMatrix = function (matrix, cols, rows) {
    if (!Array.isArray(matrix)) {
      return null;
    }

    var flat = [];
    var r, c;

    if (matrix.length === rows) {
      for (r = 0; r < rows; r++) {
        if (!Array.isArray(matrix[r]) || matrix[r].length !== cols) {
          return null;
        }
        for (c = 0; c < cols; c++) {
          flat.push(matrix[r][c]);
        }
      }
      return flat;
    }

    if (matrix.length === cols) {
      for (c = 0; c < cols; c++) {
        if (!Array.isArray(matrix[c]) || matrix[c].length !== rows) {
          return null;
        }
      }
      for (r = 0; r < rows; r++) {
        for (c = 0; c < cols; c++) {
          flat.push(matrix[c][r]);
        }
      }
      return flat;
    }

    return null;
  };

  // Validador sintático e semântico de arquivos JSON de fases personalizadas
  orbium.Util.validateLevelJson = function (rawText) {
    if (typeof rawText !== "string" || rawText.trim() === "") {
      return {
        valid: false,
        error: "ARQUIVO VAZIO OU CORROMPIDO"
      };
    }

    var parsed = null;
    try {
      parsed = JSON.parse(rawText);
    } catch (e) {
      return {
        valid: false,
        error: "ARQUIVO CORROMPIDO: SINTAXE JSON INVALIDA"
      };
    }

    if (parsed === null || typeof parsed !== "object" ||
      Array.isArray(parsed)) {
      return {
        valid: false,
        error: "FORMATO INCOMPATIVEL: ESTRUTURA JSON INVALIDA"
      };
    }

    var cols = orbium.Machine ? orbium.Machine.horizTiles : 8;
    var rows = orbium.Machine ? orbium.Machine.vertTiles : 5;
    var expectedCount = cols * rows;

    // Validação das dimensões caso informadas no JSON
    if (parsed.dimensions !== undefined) {
      if (parsed.dimensions === null || typeof parsed.dimensions !== "object" ||
        parsed.dimensions.cols !== cols || parsed.dimensions.rows !== rows) {
        return {
          valid: false,
          error: "DIMENSOES INCOMPATIVEIS: ESPERADO GRADE 8X5"
        };
      }
    }

    var rawMatrix = parsed.matrix !== undefined ?
      parsed.matrix : parsed.matriz;
    var rawTiles = parsed.tiles !== undefined ?
      parsed.tiles : (parsed.pecas !== undefined ? parsed.pecas : parsed.grid);

    if (rawMatrix === undefined && rawTiles === undefined) {
      return {
        valid: false,
        error: "FORMATO INCOMPATIVEL: MATRIZ 8X5 DE TILES AUSENTE"
      };
    }

    var fromMatrix = null;
    if (rawMatrix !== undefined) {
      fromMatrix = flattenMatrix(rawMatrix, cols, rows);
      if (fromMatrix === null) {
        return {
          valid: false,
          error: "MATRIZ INVALIDA: DEVE SER 8X5 COM EXATAMENTE 40 TILES"
        };
      }
    }

    var fromTiles = null;
    if (rawTiles !== undefined) {
      if (!Array.isArray(rawTiles)) {
        return {
          valid: false,
          error: "FORMATO INCOMPATIVEL: LISTA DE TILES INVALIDA"
        };
      }

      if (rawTiles.length > 0 && Array.isArray(rawTiles[0])) {
        fromTiles = flattenMatrix(rawTiles, cols, rows);
        if (fromTiles === null) {
          return {
            valid: false,
            error: "MATRIZ INVALIDA: DEVE SER 8X5 COM EXATAMENTE 40 TILES"
          };
        }
      } else {
        if (rawTiles.length !== expectedCount) {
          return {
            valid: false,
            error: "QUANTIDADE INVALIDA: ESPERADO 40 TILES (ENCONTRADO " +
              rawTiles.length + ")"
          };
        }
        fromTiles = rawTiles.slice();
      }
    }

    // Se ambos foram informados, verifica consistência entre matrix e tiles
    if (fromMatrix !== null && fromTiles !== null) {
      for (var k = 0; k < expectedCount; k++) {
        if (fromMatrix[k] !== fromTiles[k]) {
          return {
            valid: false,
            error: "DADOS INCONSISTENTES ENTRE MATRIZ E LISTA DE TILES"
          };
        }
      }
    }

    var flatTiles = fromMatrix !== null ? fromMatrix : fromTiles;

    if (!flatTiles || flatTiles.length !== expectedCount) {
      return {
        valid: false,
        error: "QUANTIDADE INVALIDA: O MAPA DEVE CONTER 40 TILES"
      };
    }

    // Validação semântica de cada uma das 40 peças
    for (var i = 0; i < expectedCount; i++) {
      var symbol = flatTiles[i];
      if (!orbium.Util.isValidTileSymbol(symbol)) {
        return {
          valid: false,
          error: "TILE INVALIDO NA POSICAO " + (i + 1) +
            " (" + String(symbol) + ")"
        };
      }
    }

    // Validação dos metadados
    var rawName = parsed.name !== undefined ? parsed.name : parsed.nome;
    if (rawName !== undefined &&
      (typeof rawName !== "string" || rawName.trim() === "")) {
      return {
        valid: false,
        error: "METADADO INVALIDO: NOME DA FASE DEVE SER TEXTO"
      };
    }

    var rawAuthor = parsed.author !== undefined ? parsed.author : parsed.autor;
    if (rawAuthor !== undefined &&
      (typeof rawAuthor !== "string" || rawAuthor.trim() === "")) {
      return {
        valid: false,
        error: "METADADO INVALIDO: AUTOR DEVE SER TEXTO"
      };
    }

    var rawDate = parsed.createdAt !== undefined ?
      parsed.createdAt : parsed.dataCriacao;
    if (rawDate !== undefined &&
      (typeof rawDate !== "string" || isNaN(Date.parse(rawDate)))) {
      return {
        valid: false,
        error: "METADADO INVALIDO: DATA DE CRIACAO INVALIDA"
      };
    }

    // Validação dos limites de tempo (calha/relógio)
    var rawLimits = parsed.timeLimits !== undefined ?
      parsed.timeLimits : (parsed.limitesTempo !== undefined ?
        parsed.limitesTempo : parsed.limits);

    var laneLimit = 20;
    var clockLimit = 10;

    if (rawLimits !== undefined) {
      if (rawLimits === null || typeof rawLimits !== "object" ||
        Array.isArray(rawLimits)) {
        return {
          valid: false,
          error: "LIMITES DE TEMPO INVALIDOS"
        };
      }

      var rawLane = rawLimits.lane !== undefined ?
        rawLimits.lane : (rawLimits.calha !== undefined ?
          rawLimits.calha : rawLimits.orb);
      var rawClock = rawLimits.clock !== undefined ?
        rawLimits.clock : (rawLimits.relogio !== undefined ?
          rawLimits.relogio : rawLimits.level);

      laneLimit = parsePositiveInt(rawLane, 20);
      clockLimit = parsePositiveInt(rawClock, 10);

      if (laneLimit === null || clockLimit === null) {
        return {
          valid: false,
          error: "LIMITES DE TEMPO INVALIDOS (CALHA/RELOGIO)"
        };
      }
    } else {
      if (parsed.laneLimit !== undefined) {
        laneLimit = parsePositiveInt(parsed.laneLimit, 20);
      }
      if (parsed.clockLimit !== undefined) {
        clockLimit = parsePositiveInt(parsed.clockLimit, 10);
      }
      if (laneLimit === null || clockLimit === null) {
        return {
          valid: false,
          error: "LIMITES DE TEMPO INVALIDOS (CALHA/RELOGIO)"
        };
      }
    }

    return {
      valid: true,
      data: {
        name: rawName ? rawName.trim().substring(0, 24) : "CUSTOM 01",
        author: rawAuthor ? rawAuthor.trim().substring(0, 24) : "PLAYER",
        createdAt: rawDate || new Date().toISOString(),
        matrix: orbium.Util.buildTileMatrix(flatTiles, cols, rows),
        tiles: flatTiles,
        timeLimits: {
          lane: laneLimit,
          clock: clockLimit
        }
      }
    };
  };

  // Dispara o download automático do arquivo .json via Blob e URL temporária
  orbium.Util.downloadJsonFile = function (jsonContent, filename) {
    if (typeof Blob === "undefined" || !window.URL ||
      !window.URL.createObjectURL) {
      return false;
    }

    var safeName = (filename || "orbium-level")
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!safeName) {
      safeName = "orbium-level";
    }
    if (safeName.slice(-5) !== ".json") {
      safeName += ".json";
    }

    var blob = new Blob([jsonContent], {
      type: "application/json;charset=utf-8"
    });
    var url = window.URL.createObjectURL(blob);

    var link = document.createElement("a");
    link.style.display = "none";
    link.href = url;
    link.setAttribute("download", safeName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(function () {
      window.URL.revokeObjectURL(url);
    }, 1000);

    return true;
  };
})(typeof window == "object" ? window.orbium = window.orbium || {} : orbium);
