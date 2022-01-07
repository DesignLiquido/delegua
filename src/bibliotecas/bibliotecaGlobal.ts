import { ErroEmTempoDeExecucao } from "../erro";
import { DeleguaFuncao } from "../estruturas/funcao";
import { DeleguaInstancia } from "../estruturas/instancia";
import { FuncaoPadrao } from "../estruturas/funcaoPadrao";
import { DeleguaClasse } from "../estruturas/classe";


export default function (interpretador: any, global: any) {
    // Retorna um número aleatório entre 0 e 1.
    global.definirVariavel(
        "aleatorio",
        new FuncaoPadrao(1, function () {
            return Math.random();
        })
    );

    // Retorna um número aleatório de acordo com o parâmetro passado.
    // Mínimo(inclusivo) - Máximo(exclusivo)
    global.definirVariavel(
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

    global.definirVariavel(
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

    global.definirVariavel(
        "mapear",
        new FuncaoPadrao(1, function (array: any, callback: any) {
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

    global.definirVariavel(
        "ordenar",
        new FuncaoPadrao(1, function (objeto: Array<any>) {
            if (!Array.isArray(objeto)) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    "Valor Inválido. Objeto inserido não é um vetor."
                );
            }

            let trocado;
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

    global.definirVariavel(
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

    global.definirVariavel(
        "tamanho",
        new FuncaoPadrao(1, function (objeto: any) {
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

    global.definirVariavel(
        "texto",
        new FuncaoPadrao(1, function (valor: any) {
            return `${valor}`;
        })
    );

    global.definirVariavel("exports", {});

    return global;
};
