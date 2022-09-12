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

const verificaModulosDelegua = (nome: string): string | boolean => {
    const modulos = {
        "estatistica": "@designliquido/delegua-estatistica",
        "estatística": "@designliquido/delegua-estatistica",
        "fisica": "@designliquido/delegua-fisica",
        "física": "@designliquido/delegua-fisica",
        "matematica": "@designliquido/delegua-matematica",
        "matemática": "@designliquido/delegua-matematica",
    }

    if (Object.keys(modulos).includes(nome)) {
        return modulos[nome].toString();
    };

    return false
};

export default function (nome: string) {
    const verificaModulos = verificaModulosDelegua(nome);
    return (
        verificaModulos
        ? (
            carregarBiblioteca(verificaModulos, verificaModulos)
        ) : (
            carregarBiblioteca(nome, nome)
        ));
};
