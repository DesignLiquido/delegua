const RuntimeError = require("../errors.js").RuntimeError,
    StandardFn = require("../estruturas/funcaoPadrao.js"),
    DeleguaModulo = require("../estruturas/modulo.js");

const carregarModulo = function (nomeDoModulo, caminhoDoModulo) {
    let dadosDoModulo;
    try {
        dadosDoModulo = require(caminhoDoModulo);
    } catch (erro) {
        throw new RuntimeError(nomeDoModulo, `Biblioteca ${nomeDoModulo} não encontrada para importação.`);
    }
     
    let novoModulo = new DeleguaModulo(nomeDoModulo);

    let chaves = Object.keys(dadosDoModulo);
    for (let i = 0; i < chaves.length; i++) {
        const moduloAtual = dadosDoModulo[chaves[i]];

        if (typeof moduloAtual === "function") {
            novoModulo[chaves[i]] = new StandardFn(moduloAtual.length, moduloAtual);
        } else {
            novoModulo[chaves[i]] = moduloAtual;
        }
    }

    return novoModulo;
};

module.exports = function (nome) {
    //TODO:Samuel: Testar melhor isso depois.
    return carregarModulo(nome, nome);
};