import { ErroEmTempoDeExecucao } from "../excecoes";
import { DeleguaFuncao } from "../estruturas/funcao";
import { ObjetoDeleguaClasse } from "../estruturas/objeto-delegua-classe";
import { FuncaoPadrao } from "../estruturas/funcao-padrao";
import { DeleguaClasse } from "../estruturas/delegua-classe";
import { InterpretadorInterface } from "../interfaces";
import { PilhaEscoposExecucaoInterface } from "../interfaces/pilha-escopos-execucao-interface";


export default function (interpretador: InterpretadorInterface, pilhaEscoposExecucao: PilhaEscoposExecucaoInterface) {
    // Retorna um número aleatório entre 0 e 1.
    pilhaEscoposExecucao.definirVariavel(
        "aleatorio",
        new FuncaoPadrao(1, function () {
            return Math.random();
        })
    );

    // Retorna um número aleatório de acordo com o parâmetro passado.
    // Mínimo(inclusivo) - Máximo(exclusivo)
    pilhaEscoposExecucao.definirVariavel(
        "aleatorioEntre",
        new FuncaoPadrao(1, function (minimo: number, maximo: number) {
            if (typeof minimo !== 'number' || typeof maximo !== 'number') {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    "Os dois parâmetros devem ser do tipo número."
                );
            }

            return Math.floor(Math.random() * (maximo - minimo)) + minimo;
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        "inteiro",
        new FuncaoPadrao(1, function (valor: any) {
            if (!valor) {
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

    pilhaEscoposExecucao.definirVariavel(
        "mapear",
        new FuncaoPadrao(1, function (array: any, callback: any) {
            if (!Array.isArray(array)) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    "Parâmetro inválido. O primeiro parâmetro da função, deve ser um array."
                );
            }

            if (callback.constructor.name !== 'DeleguaFuncao') {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    "Parâmetro inválido. O segundo parâmetro da função, deve ser uma função."
                );
            }

            let resultados = [];
            for (let indice = 0; indice < array.length; ++indice) {
                resultados.push(
                    callback.chamar(
                        interpretador, [array[indice]]
                    )
                );
            }

            return resultados;
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        "ordenar",
        new FuncaoPadrao(1, function (objeto: Array<any>) {
            if (!Array.isArray(objeto)) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    "Valor Inválido. Objeto inserido não é um vetor."
                );
            }

            let trocado: boolean;
            let tamanho = objeto.length;
            do {
                trocado = false;
                for (var i = 0; i < tamanho - 1; i++) {
                    if (objeto[i] > objeto[i + 1]) {
                        [objeto[i], objeto[i + 1]] = [objeto[i + 1], objeto[i]];
                        trocado = true;
                    }
                }
            } while (trocado);
            return objeto;
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        "real",
        new FuncaoPadrao(1, function (valor: any) {
            if (!/^-{0,1}\d+$/.test(valor) && !/^\d+\.\d+$/.test(valor))
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    "Somente números podem passar para real."
                );
            return parseFloat(valor);
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        "tamanho",
        new FuncaoPadrao(1, function (objeto: any) {
            if (!isNaN(objeto)) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    "Não é possível encontrar o tamanho de um número."
                );
            }

            if (objeto instanceof ObjetoDeleguaClasse) {
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

    pilhaEscoposExecucao.definirVariavel(
        "texto",
        new FuncaoPadrao(1, function (valor: any) {
            return `${valor}`;
        })
    );

    pilhaEscoposExecucao.definirVariavel("exports", {});

    return pilhaEscoposExecucao;
};
