import { ErroEmTempoDeExecucao } from "../erro";
import { FuncaoPadrao } from "../estruturas/funcaoPadrao";
import { DeleguaModulo } from "../estruturas/modulo";

const carregarModulo = function (nomeDoModulo: any, caminhoDoModulo: any) {
    let dadosDoModulo: any;

    try {
        dadosDoModulo = require(caminhoDoModulo);
    } catch (erro) {
        throw new ErroEmTempoDeExecucao(nomeDoModulo, `Biblioteca ${nomeDoModulo} não encontrada para importação.`);
    }
     
    let novoModulo = new DeleguaModulo(nomeDoModulo);

    let chaves = Object.keys(dadosDoModulo);
    for (let i = 0; i < chaves.length; i++) {
        const moduloAtual = dadosDoModulo[chaves[i]];

        if (typeof moduloAtual === "function") {
            novoModulo[chaves[i]] = new FuncaoPadrao(moduloAtual.length, moduloAtual);
        } else {
            novoModulo[chaves[i]] = moduloAtual;
        }
    }

    return novoModulo;
};

export default function (nome: any) {
    return carregarModulo(nome, nome);
};
