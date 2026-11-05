(function (orbium, undefined) {
  orbium.Storage = function () {
    // Em modo privado ou com o armazenamento bloqueado, até acessar
    // window.localStorage lança exceção. Nesses casos a leitura devolve
    // null e a escrita é ignorada, para não derrubar o jogo.
    this.readValue = function (name) {
      try {
        return window.localStorage.getItem(name);
      } catch (e) {
        return null;
      }
    };

    // Lê um valor que deve ser um número inteiro, dentro de [min, max]
    // (os dois limites são opcionais). Devolve null se o valor não
    // existir, estiver corrompido (ex: "null", "NaN", "12abc") ou
    // estiver fora dos limites.
    this.readInt = function (name, min, max) {
      var value = this.readValue(name);

      if (value === null || value === undefined ||
        !/^-?\d+$/.test(String(value))) {
        return null;
      }

      var number = parseInt(value, 10);

      if (!isFinite(number) ||
        (min !== undefined && number < min) ||
        (max !== undefined && number > max)) {
        return null;
      }

      return number;
    };

    // Devolve false se não foi possível gravar (ex: cota cheia)
    this.writeValue = function (name, value) {
      try {
        window.localStorage.setItem(name, value);
      } catch (e) {
        return false;
      }

      return true;
    };

    this.deleteValue = function (name) {
      try {
        window.localStorage.removeItem(name);
      } catch (e) {
        return false;
      }

      return true;
    };
  };
})(typeof window == "object" ? window.orbium = window.orbium || {} : orbium);
