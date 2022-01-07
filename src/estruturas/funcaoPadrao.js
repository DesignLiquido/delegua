const Callable = require("./callable");

module.exports = class FuncaoPadrao extends Callable {
    constructor(valorAridade, funcao) {
        super();
        this.valorAridade = valorAridade;
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