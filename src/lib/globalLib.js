const ErroEmTempoDeExecucao = require("../erro.js").ErroEmTempoDeExecucao,
    DeleguaFuncao = require("../estruturas/funcao.js"),
    DeleguaInstancia = require("../estruturas/instancia.js"),
    FuncaoPadrao = require("../estruturas/funcaoPadrao.js"),
    DeleguaClasse = require("../estruturas/classe.js");


module.exports = function (interpretador, globals) {
    // Retorna um número aleatório entre 0 e 1.
    globals.definirVariavel(
        "aleatorio",
        new FuncaoPadrao(1, function () {
            return Math.random();
        })
    );

    // Retorna um número aleatório de acordo com o parâmetro passado.
    // MIN(inclusivo) - MAX(exclusivo)
    globals.definirVariavel(
        "aleatorioEntre",
        new FuncaoPadrao(1, function (min, max) {
            if (typeof min !== 'number' || typeof max !== 'number') {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    "Os dois parâmetros devem ser do tipo número."
                );
            }

            return Math.floor(Math.random() * (max - min)) + min;
        })
    );    

    globals.definirVariavel(
        "inteiro",
        new FuncaoPadrao(1, function (valor) {
            if (valor === undefined || valor === null) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    "Somente números podem passar para inteiro."
                );
            }

            if (!/^-{0,1}\d+$/.test(valor) && !/^\d+\.\d+$/.test(valor)) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    "Somente números podem passar para inteiro."
                );
            }

            return parseInt(valor);
        })
    );

    globals.definirVariavel(
        "mapear",
        new FuncaoPadrao(1, function (array, callback) {
            if (!Array.isArray(array)) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    "Parâmetro inválido. O primeiro parâmetro da função, deve ser um array."
                );
            }

            if (callback.constructor.nome !== 'DeleguaFuncao') {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    "Parâmetro inválido. O segundo parâmetro da função, deve ser uma função."
                );
            }

            let provisorio = [];
            for (let indice = 0; indice < array.length; ++indice) {
                provisorio.push(
                    callback.call(
                        interpretador, [array[indice]]
                    )
                );
            }

            return provisorio;
        })
    );

    globals.definirVariavel(
        "ordenar",
        new FuncaoPadrao(1, function (obj) {
            if (Array.isArray(obj) == false) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    "Valor Inválido. Objeto inserido não é um vetor."
                );
            }

            let trocado;
            let length = obj.length;
            do {
                trocado = false;
                for (var i = 0; i < length - 1; i++) {
                    if (obj[i] > obj[i + 1]) {
                        [obj[i], obj[i + 1]] = [obj[i + 1], obj[i]];
                        trocado = true;
                    }
                }
            } while (trocado);
            return obj;
        })
    );

    globals.definirVariavel(
        "real",
        new FuncaoPadrao(1, function (valor) {
            if (!/^-{0,1}\d+$/.test(valor) && !/^\d+\.\d+$/.test(valor))
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    "Somente números podem passar para real."
                );
            return parseFloat(valor);
        })
    );

    globals.definirVariavel(
        "tamanho",
        new FuncaoPadrao(1, function (objeto) {
            if (!isNaN(objeto)) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    "Não é possível encontrar o tamanho de um número."
                );
            }

            if (objeto instanceof DeleguaInstancia) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    "Você não pode encontrar o tamanho de uma declaração."
                );
            }

            if (objeto instanceof DeleguaFuncao) {
                return objeto.declaracao.parametros.length;
            }

            if (objeto instanceof FuncaoPadrao) {
                return objeto.valorAridade;
            }

            if (objeto instanceof DeleguaClasse) {
                let metodos = objeto.metodos;
                let tamanho = 0;

                if (metodos.init && metodos.init.eInicializador) {
                    tamanho = metodos.init.declaracao.parametros.length;
                }

                return tamanho;
            }

            return objeto.length;
        })
    );

    globals.definirVariavel(
        "texto",
        new FuncaoPadrao(1, function (valor) {
            return `${valor}`;
        })
    );

    globals.definirVariavel("exports", {});

    return globals;
};
