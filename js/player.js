(function (orbium, undefined) {
  orbium.Player = function () {
    this.muted = null; // Muted flag

    this.construct = function () {
      this.muted = true;

      // Load the saved sound preference, if any
      if (orbium.storage !== undefined && orbium.storage !== null) {
        this.muted = orbium.storage.readValue("sound") !== "true";
      }
    };

    this.play = function (sound) {
      if (!this.muted) {
        return new Audio("snd/" + sound + ".mp3").play();
      }
    };

    this.construct.apply(this, arguments);
  };
})(typeof window == "object" ? window.orbium = window.orbium || {} : orbium);
