(function (orbium, undefined) {
  orbium.Storage = function () {
    this.readValue = function (name) {
      return window.localStorage.getItem(name);
    };

    this.writeValue = function (name, value) {
      window.localStorage.setItem(name, value);
    };

    this.deleteValue = function (name) {
      window.localStorage.removeItem(name);
    };
  };
})(typeof window == "object" ? window.orbium = window.orbium || {} : orbium);
