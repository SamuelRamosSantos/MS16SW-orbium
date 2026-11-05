// Service Worker do Orbium: guarda os arquivos do jogo no cache do navegador
// para ele abrir e funcionar sem internet.
//
// Ao adicionar ou remover arquivos do jogo, atualize a lista FILES e aumente
// o número da versão em CACHE_NAME para os jogadores receberem a mudança.
var CACHE_NAME = "orbium-v2";

var FILES = [
  "./",
  "index.html",
  "manifest.json",
  "css/style.css",
  "js/start.js",
  "js/1152x784.js",
  "js/levels.js",
  "js/util.js",
  "js/sprite.js",
  "js/tile.js",
  "js/emptytile.js",
  "js/rotator.js",
  "js/horiztile.js",
  "js/verttile.js",
  "js/crosstile.js",
  "js/counter.js",
  "js/announcer.js",
  "js/timer.js",
  "js/clock.js",
  "js/teleporter.js",
  "js/inspector.js",
  "js/transformer.js",
  "js/director.js",
  "js/matcher.js",
  "js/sequencer.js",
  "js/indicator.js",
  "js/falltile.js",
  "js/lane.js",
  "js/bar.js",
  "js/marble.js",
  "js/dockee.js",
  "js/loader.js",
  "js/player.js",
  "js/storage.js",
  "js/stats.js",
  "js/menu.js",
  "js/editor.js",
  "js/sign.js",
  "js/perf.js",
  "js/stopwatch.js",
  "js/client.js",
  "js/tutorial.js",
  "js/input.js",
  "js/thumbnail.js",
  "js/machine.js",
  "js/init.js",
  "ico/app_16x16.png",
  "ico/app_32x32.png",
  "ico/app_120x120.png",
  "ico/app_128x128.png",
  "ico/app_192x192.png",
  "ico/app_512x512.png",
  "snd/bounce.mp3",
  "snd/clank.mp3",
  "snd/dock.mp3",
  "snd/explode.mp3",
  "snd/rotate.mp3",
  "gfx/1152x784/announcer0.png",
  "gfx/1152x784/announcer1.png",
  "gfx/1152x784/announcer2.png",
  "gfx/1152x784/announcer3.png",
  "gfx/1152x784/announcer4.png",
  "gfx/1152x784/announcer5.png",
  "gfx/1152x784/bar0.png",
  "gfx/1152x784/bar1.png",
  "gfx/1152x784/bar2.png",
  "gfx/1152x784/bar3.png",
  "gfx/1152x784/bar4.png",
  "gfx/1152x784/bar5.png",
  "gfx/1152x784/bar6.png",
  "gfx/1152x784/bar7.png",
  "gfx/1152x784/bar8.png",
  "gfx/1152x784/bar9.png",
  "gfx/1152x784/bar10.png",
  "gfx/1152x784/bar11.png",
  "gfx/1152x784/bar12.png",
  "gfx/1152x784/bar13.png",
  "gfx/1152x784/bar14.png",
  "gfx/1152x784/bar15.png",
  "gfx/1152x784/clock0.png",
  "gfx/1152x784/clock1.png",
  "gfx/1152x784/clock2.png",
  "gfx/1152x784/clock3.png",
  "gfx/1152x784/clock4.png",
  "gfx/1152x784/clock5.png",
  "gfx/1152x784/clock6.png",
  "gfx/1152x784/clock7.png",
  "gfx/1152x784/clock8.png",
  "gfx/1152x784/clock9.png",
  "gfx/1152x784/counter0.png",
  "gfx/1152x784/counter1.png",
  "gfx/1152x784/counter2.png",
  "gfx/1152x784/counter3.png",
  "gfx/1152x784/counter4.png",
  "gfx/1152x784/crosstile0.png",
  "gfx/1152x784/crosstile1.png",
  "gfx/1152x784/crosstile2.png",
  "gfx/1152x784/crosstile3.png",
  "gfx/1152x784/crosstile4.png",
  "gfx/1152x784/director0.png",
  "gfx/1152x784/director1.png",
  "gfx/1152x784/director2.png",
  "gfx/1152x784/director3.png",
  "gfx/1152x784/emptytile0.png",
  "gfx/1152x784/emptytile1.png",
  "gfx/1152x784/emptytile2.png",
  "gfx/1152x784/emptytile3.png",
  "gfx/1152x784/emptytile4.png",
  "gfx/1152x784/emptytile5.png",
  "gfx/1152x784/emptytile6.png",
  "gfx/1152x784/explosion0.png",
  "gfx/1152x784/explosion1.png",
  "gfx/1152x784/explosion2.png",
  "gfx/1152x784/explosion3.png",
  "gfx/1152x784/horiztile0.png",
  "gfx/1152x784/horiztile1.png",
  "gfx/1152x784/horiztile2.png",
  "gfx/1152x784/horiztile3.png",
  "gfx/1152x784/horiztile4.png",
  "gfx/1152x784/horiztile5.png",
  "gfx/1152x784/inspector0.png",
  "gfx/1152x784/inspector1.png",
  "gfx/1152x784/inspector2.png",
  "gfx/1152x784/inspector3.png",
  "gfx/1152x784/inspector4.png",
  "gfx/1152x784/inspector5.png",
  "gfx/1152x784/marble0.png",
  "gfx/1152x784/marble1.png",
  "gfx/1152x784/marble2.png",
  "gfx/1152x784/marble3.png",
  "gfx/1152x784/marble4.png",
  "gfx/1152x784/marble5.png",
  "gfx/1152x784/marble6.png",
  "gfx/1152x784/marble7.png",
  "gfx/1152x784/marble8.png",
  "gfx/1152x784/marble9.png",
  "gfx/1152x784/marble10.png",
  "gfx/1152x784/marble11.png",
  "gfx/1152x784/marble12.png",
  "gfx/1152x784/marble13.png",
  "gfx/1152x784/marble14.png",
  "gfx/1152x784/marble15.png",
  "gfx/1152x784/marble16.png",
  "gfx/1152x784/marble17.png",
  "gfx/1152x784/marble18.png",
  "gfx/1152x784/marble19.png",
  "gfx/1152x784/marble20.png",
  "gfx/1152x784/marble21.png",
  "gfx/1152x784/marble22.png",
  "gfx/1152x784/marble23.png",
  "gfx/1152x784/marble24.png",
  "gfx/1152x784/marble25.png",
  "gfx/1152x784/marble26.png",
  "gfx/1152x784/marble27.png",
  "gfx/1152x784/marble28.png",
  "gfx/1152x784/marble29.png",
  "gfx/1152x784/marble30.png",
  "gfx/1152x784/marble31.png",
  "gfx/1152x784/marble32.png",
  "gfx/1152x784/marble33.png",
  "gfx/1152x784/marble34.png",
  "gfx/1152x784/marble35.png",
  "gfx/1152x784/marble36.png",
  "gfx/1152x784/marble37.png",
  "gfx/1152x784/marble38.png",
  "gfx/1152x784/marble39.png",
  "gfx/1152x784/marble40.png",
  "gfx/1152x784/marble41.png",
  "gfx/1152x784/marble42.png",
  "gfx/1152x784/marble43.png",
  "gfx/1152x784/marble44.png",
  "gfx/1152x784/marble45.png",
  "gfx/1152x784/marble46.png",
  "gfx/1152x784/marble47.png",
  "gfx/1152x784/marble48.png",
  "gfx/1152x784/marble49.png",
  "gfx/1152x784/marble50.png",
  "gfx/1152x784/marble51.png",
  "gfx/1152x784/marble52.png",
  "gfx/1152x784/marble53.png",
  "gfx/1152x784/marble54.png",
  "gfx/1152x784/marble55.png",
  "gfx/1152x784/marble56.png",
  "gfx/1152x784/marble57.png",
  "gfx/1152x784/marble58.png",
  "gfx/1152x784/marble59.png",
  "gfx/1152x784/marble60.png",
  "gfx/1152x784/marble61.png",
  "gfx/1152x784/marble62.png",
  "gfx/1152x784/marble63.png",
  "gfx/1152x784/marble64.png",
  "gfx/1152x784/marble65.png",
  "gfx/1152x784/marble66.png",
  "gfx/1152x784/marble67.png",
  "gfx/1152x784/marble68.png",
  "gfx/1152x784/marble69.png",
  "gfx/1152x784/marble70.png",
  "gfx/1152x784/marble71.png",
  "gfx/1152x784/matcher0.png",
  "gfx/1152x784/modtile0.png",
  "gfx/1152x784/modtile1.png",
  "gfx/1152x784/modtile2.png",
  "gfx/1152x784/modtile3.png",
  "gfx/1152x784/modtile4.png",
  "gfx/1152x784/modtile5.png",
  "gfx/1152x784/modtile6.png",
  "gfx/1152x784/modtile7.png",
  "gfx/1152x784/modtile8.png",
  "gfx/1152x784/modtile9.png",
  "gfx/1152x784/modtile10.png",
  "gfx/1152x784/modtile11.png",
  "gfx/1152x784/modtile12.png",
  "gfx/1152x784/modtile13.png",
  "gfx/1152x784/modtile14.png",
  "gfx/1152x784/rotatile0.png",
  "gfx/1152x784/rotatile1.png",
  "gfx/1152x784/rotatile2.png",
  "gfx/1152x784/rotatile3.png",
  "gfx/1152x784/rotatile4.png",
  "gfx/1152x784/rotatile5.png",
  "gfx/1152x784/rotatile6.png",
  "gfx/1152x784/rotatile7.png",
  "gfx/1152x784/rotatile8.png",
  "gfx/1152x784/rotatile9.png",
  "gfx/1152x784/rotatile10.png",
  "gfx/1152x784/rotatile11.png",
  "gfx/1152x784/rotatile12.png",
  "gfx/1152x784/rotatile13.png",
  "gfx/1152x784/rotatile14.png",
  "gfx/1152x784/rotatile15.png",
  "gfx/1152x784/rotatile16.png",
  "gfx/1152x784/rotatile17.png",
  "gfx/1152x784/rotatile18.png",
  "gfx/1152x784/rotatile19.png",
  "gfx/1152x784/rotatile20.png",
  "gfx/1152x784/rotatile21.png",
  "gfx/1152x784/rotatile22.png",
  "gfx/1152x784/rotatile23.png",
  "gfx/1152x784/rotatile24.png",
  "gfx/1152x784/rotatile25.png",
  "gfx/1152x784/rotatile26.png",
  "gfx/1152x784/rotatile27.png",
  "gfx/1152x784/rotatile28.png",
  "gfx/1152x784/rotatile29.png",
  "gfx/1152x784/rotator0.png",
  "gfx/1152x784/rotator1.png",
  "gfx/1152x784/rotator2.png",
  "gfx/1152x784/rotator3.png",
  "gfx/1152x784/rotator4.png",
  "gfx/1152x784/rotator5.png",
  "gfx/1152x784/rotator6.png",
  "gfx/1152x784/rotator7.png",
  "gfx/1152x784/rotator8.png",
  "gfx/1152x784/rotator9.png",
  "gfx/1152x784/rotator10.png",
  "gfx/1152x784/rotator11.png",
  "gfx/1152x784/rotator12.png",
  "gfx/1152x784/rotator13.png",
  "gfx/1152x784/rotator14.png",
  "gfx/1152x784/rotator15.png",
  "gfx/1152x784/rotator16.png",
  "gfx/1152x784/rotator17.png",
  "gfx/1152x784/rotator18.png",
  "gfx/1152x784/rotator19.png",
  "gfx/1152x784/rotator20.png",
  "gfx/1152x784/rotator21.png",
  "gfx/1152x784/rotator22.png",
  "gfx/1152x784/rotator23.png",
  "gfx/1152x784/rotator24.png",
  "gfx/1152x784/rotator25.png",
  "gfx/1152x784/rotator26.png",
  "gfx/1152x784/rotator27.png",
  "gfx/1152x784/rotator28.png",
  "gfx/1152x784/rotator29.png",
  "gfx/1152x784/rotator30.png",
  "gfx/1152x784/rotator31.png",
  "gfx/1152x784/sequencer0.png",
  "gfx/1152x784/teleporter0.png",
  "gfx/1152x784/teleporter1.png",
  "gfx/1152x784/teleporter2.png",
  "gfx/1152x784/timer0.png",
  "gfx/1152x784/timer1.png",
  "gfx/1152x784/transformer0.png",
  "gfx/1152x784/transformer1.png",
  "gfx/1152x784/transformer2.png",
  "gfx/1152x784/transformer3.png",
  "gfx/1152x784/transformer4.png",
  "gfx/1152x784/transformer5.png",
  "gfx/1152x784/verttile0.png",
  "gfx/1152x784/verttile1.png",
  "gfx/1152x784/verttile2.png",
  "gfx/1152x784/verttile3.png",
  "gfx/1152x784/verttile4.png",
  "gfx/1152x784/verttile5.png"
];

// Guarda cada arquivo separadamente: se um deles falhar, os outros continuam
// sendo guardados. Arquivos que ficarem de fora entram no cache na primeira
// vez em que forem usados com internet.
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return Promise.all(FILES.map(function (file) {
        // cache "reload" ignora o cache HTTP, para guardar a versão atual
        return cache.add(new Request(file, {cache: "reload"}))
          .catch(function () {});
      }));
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

// Apaga os caches de versões antigas do jogo
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(names.filter(function (name) {
        return name.indexOf("orbium-") === 0 && name !== CACHE_NAME;
      }).map(function (name) {
        return caches.delete(name);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

// Páginas e códigos podem mudar: tenta a internet primeiro e só usa o cache
// se estiver offline. Imagens e sons não mudam: o cache vem primeiro.
var isCode = function (url) {
  var path = url.pathname;

  return path.endsWith("/") || path.endsWith(".html") ||
    path.endsWith(".js") || path.endsWith(".css") || path.endsWith(".json");
};

// O jogo recebe parâmetros na URL (ex: ?w=1400&h=900), que não mudam o
// arquivo. O cache guarda a página sem eles.
var cacheKey = function (request) {
  var url = new URL(request.url);

  return isCode(url) ? url.origin + url.pathname : request.url;
};

var save = function (request, response) {
  // Respostas parciais (206) não podem ser guardadas
  if (response && response.status === 200) {
    var copy = response.clone();

    caches.open(CACHE_NAME).then(function (cache) {
      cache.put(cacheKey(request), copy);
    });
  }

  return response;
};

// Os navegadores pedem os sons em pedaços (cabeçalho Range). Devolve só o
// pedaço pedido do arquivo guardado.
var partial = function (request, response) {
  var range = request.headers.get("range");

  if (!range || range.indexOf("bytes=") !== 0) {
    return Promise.resolve(response);
  }

  return response.arrayBuffer().then(function (buffer) {
    var size = buffer.byteLength;
    var parts = range.replace("bytes=", "").split("-");

    var start = parts[0] === "" ? size - Number(parts[1]) : Number(parts[0]);
    var end = parts[0] === "" || parts[1] === "" ?
      size - 1 : Math.min(Number(parts[1]), size - 1);
    var chunk = buffer.slice(start, end + 1);

    return new Response(chunk, {
      status: 206,
      statusText: "Partial Content",
      headers: {
        "Content-Type": response.headers.get("Content-Type"),
        "Content-Range": "bytes " + start + "-" + end + "/" + size,
        "Content-Length": chunk.byteLength
      }
    });
  });
};

var networkFirst = function (request) {
  return fetch(request).then(function (response) {
    return save(request, response);
  }).catch(function () {
    return caches.match(cacheKey(request)).then(function (cached) {
      // Offline em uma página que não está guardada: abre o jogo
      return cached || (request.mode === "navigate" ?
        caches.match(new URL("index.html", self.registration.scope).href) :
        undefined);
    });
  });
};

var cacheFirst = function (request) {
  return caches.match(cacheKey(request)).then(function (cached) {
    if (cached) {
      return partial(request, cached);
    }

    return fetch(request).then(function (response) {
      return save(request, response);
    });
  });
};

self.addEventListener("fetch", function (event) {
  var request = event.request;
  var url = new URL(request.url);

  // Só cuida dos arquivos do próprio jogo
  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(isCode(url) ? networkFirst(request) : cacheFirst(request));
});
