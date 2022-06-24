import { ErroEmTempoDeExecucao } from "../excecoes";
import { FuncaoPadrao } from "../estruturas/funcao-padrao";
import { DeleguaModulo } from "../estruturas/modulo";

const carregarBiblioteca = function (nomeDaBiblioteca: any, caminhoDaBiblioteca: any) {
    let dadosDoModulo: any;

    try {
        dadosDoModulo = require(caminhoDaBiblioteca);
    } catch (erro: any) {
        throw new ErroEmTempoDeExecucao(nomeDaBiblioteca, `Biblioteca ${nomeDaBiblioteca} não encontrada para importação.`);
    }

    let novoModulo = new DeleguaModulo(nomeDaBiblioteca);

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

export default function (nome: string) {
    return carregarBiblioteca(nome, nome);
};
