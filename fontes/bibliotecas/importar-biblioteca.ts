import { ErroEmTempoDeExecucao } from "../excecoes";
import { FuncaoPadrao } from "../estruturas/funcao-padrao";
import { DeleguaModulo } from "../estruturas/modulo";

const carregarBiblioteca = function (nomeDaBiblioteca: string, caminhoDaBiblioteca: any) {
    let dadosDoModulo: any;

    try {
        dadosDoModulo = require(caminhoDaBiblioteca);
    } catch (erro: any) {
        throw new ErroEmTempoDeExecucao(null, `Biblioteca ${nomeDaBiblioteca} não encontrada para importação.`);
    }

    const novoModulo = new DeleguaModulo(nomeDaBiblioteca);

    const chaves = Object.keys(dadosDoModulo);
    for (let i = 0; i < chaves.length; i++) {
        const moduloAtual = dadosDoModulo[chaves[i]];

        if (typeof moduloAtual === "function") {
            novoModulo.componentes[chaves[i]] = new FuncaoPadrao(moduloAtual.length, moduloAtual);
        } else {
            novoModulo.componentes[chaves[i]] = moduloAtual;
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
            carregarBiblioteca(String(verificaModulos), verificaModulos)
        ) : (
            carregarBiblioteca(nome, nome)
        ));
};
