const RuntimeError = require("../errors.js").RuntimeError,
    DeleguaFuncao = require("../estruturas/funcao.js"),
    DeleguaInstancia = require("../estruturas/instancia.js"),
    FuncaoPadrao = require("../estruturas/funcaoPadrao.js"),
    DeleguaClasse = require("../estruturas/classe.js");


module.exports = function (interpreter, globals) {
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
                throw new RuntimeError(
                    this.token,
                    "Os dois parâmetros devem ser do tipo número."
                );
            }

            return Math.floor(Math.random() * (max - min)) + min;
        })
    );    

    globals.definirVariavel(
        "inteiro",
        new FuncaoPadrao(1, function (value) {
            if (value === undefined || value === null) {
                throw new RuntimeError(
                    this.token,
                    "Somente números podem passar para inteiro."
                );
            }

            if (!/^-{0,1}\d+$/.test(value) && !/^\d+\.\d+$/.test(value)) {
                throw new RuntimeError(
                    this.token,
                    "Somente números podem passar para inteiro."
                );
            }

            return parseInt(value);
        })
    );

    globals.definirVariavel(
        "mapear",
        new FuncaoPadrao(1, function (array, callback) {
            if (!Array.isArray(array)) {
                throw new RuntimeError(
                    this.token,
                    "Parâmetro inválido. O primeiro parâmetro da função, deve ser um array."
                );
            }

            if (callback.constructor.name !== 'DeleguaFuncao') {
                throw new RuntimeError(
                    this.token,
                    "Parâmetro inválido. O segundo parâmetro da função, deve ser uma função."
                );
            }

            let provisorio = [];
            for (let index = 0; index < array.length; ++index) {
                provisorio.push(
                    callback.call(
                        interpreter, [array[index]]
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
                throw new RuntimeError(
                    this.token,
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
        new FuncaoPadrao(1, function (value) {
            if (!/^-{0,1}\d+$/.test(value) && !/^\d+\.\d+$/.test(value))
                throw new RuntimeError(
                    this.token,
                    "Somente números podem passar para real."
                );
            return parseFloat(value);
        })
    );

    globals.definirVariavel(
        "tamanho",
        new FuncaoPadrao(1, function (obj) {
            if (!isNaN(obj)) {
                throw new RuntimeError(
                    this.token,
                    "Não é possível encontrar o tamanho de um número."
                );
            }

            if (obj instanceof DeleguaInstancia) {
                throw new RuntimeError(
                    this.token,
                    "Você não pode encontrar o tamanho de uma declaração."
                );
            }

            if (obj instanceof DeleguaFuncao) {
                return obj.declaration.params.length;
            }

            if (obj instanceof FuncaoPadrao) {
                return obj.arityValue;
            }

            if (obj instanceof EguaClass) {
                let methods = obj.methods;
                let length = 0;

                if (methods.init && methods.init.isInitializer) {
                    length = methods.init.declaration.params.length;
                }

                return length;
            }

            return obj.length;
        })
    );

    globals.definirVariavel(
        "texto",
        new FuncaoPadrao(1, function (value) {
            return `${value}`;
        })
    );

    globals.definirVariavel("exports", {});

    return globals;
};
