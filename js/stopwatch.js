(function (orbium, undefined) {
  orbium.Stopwatch = function () {
    var textFactor = 4;
    var stopwatch0 = null;

    var t = null;
    var shownSeconds = null;

    var pad = function (n) {
      return n < 10 ? "0" + n : "" + n;
    };

    // Formata os segundos como MM:SS (os minutos podem passar de 99)
    var format = function (seconds) {
      return pad(Math.floor(seconds / 60)) + ":" + pad(seconds % 60);
    };

    this.construct = function () {
      stopwatch0 = document.getElementById("stopwatch0");

      var margin = Math.round(orbium.Marble.size / 6);
      var width = Math.round(orbium.Marble.size * 3.0);
      var height = orbium.Bar.height - margin * 2;
      var fontSize = Math.round(orbium.Tile.size / textFactor);

      // Canto superior direito da barra
      var left = orbium.xpos + orbium.width - width - margin;
      var top = orbium.ypos + margin;

      stopwatch0.style.left = "" + left + "px";
      stopwatch0.style.top = "" + top + "px";
      stopwatch0.style.width = "" + width + "px";
      stopwatch0.style.height = "" + height + "px";
      stopwatch0.style.lineHeight = "" + height + "px";
      stopwatch0.style.fontSize = "" + fontSize + "px";

      this.reset();
    };

    this.show = function () {
      stopwatch0.style.visibility = "visible";
    };

    // Zera o tempo, usado ao trocar ou reiniciar a fase
    this.reset = function () {
      t = 0;
      shownSeconds = -1;

      this.draw();
    };

    // Só é chamado com o jogo em andamento, então o cronômetro pausa
    // junto com o jogo
    this.update = function (dt) {
      t += dt;

      this.draw();
    };

    // Só mexe no DOM quando o segundo exibido muda
    this.draw = function () {
      var seconds = Math.floor(t);

      if (seconds !== shownSeconds) {
        shownSeconds = seconds;

        stopwatch0.innerHTML = format(seconds);
      }
    };

    this.construct.apply(this, arguments);
  };
})(typeof window == "object" ? window.orbium = window.orbium || {} : orbium);
