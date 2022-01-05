const Callable = require("./callable.js");

module.exports = class FuncaoPadrao extends Callable {
    constructor(arityValue, funcao) {
        super();
        this.arityValue = arityValue;
        this.funcao = funcao;
    }

    chamar(interpretador, argumentos, simbolo) {
        this.simbolo = simbolo;
        return this.funcao.apply(this, argumentos);
    }

    toString() {
        return "<função>";
    }
};