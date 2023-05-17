import { DeleguaFuncao } from "../estruturas";
import { VisitanteComumInterface } from "../interfaces";

export default {
    adicionar: (interpretador: VisitanteComumInterface, vetor: Array<any>, elemento: any): Promise<any> => {
        vetor.push(elemento);
        return Promise.resolve(vetor);
    },
    concatenar: (interpretador: VisitanteComumInterface, vetor: Array<any>, outroVetor: Array<any>): Promise<any> => {
        return Promise.resolve(vetor.concat(outroVetor));
    },
    empilhar: (interpretador: VisitanteComumInterface, vetor: Array<any>, elemento: any): Promise<any> => {
        vetor.push(elemento);
        return Promise.resolve(vetor);
    },
    encaixar: (
        interpretador: VisitanteComumInterface, 
        vetor: Array<any>,
        posicaoInicio: number,
        excluirQuantidade: number,
        elemento: any = null,
        obterElementosExcluidos: boolean = false
    ): Promise<any> => {
        let elementosExcluidos = elemento
            ? vetor.splice(posicaoInicio, excluirQuantidade, elemento)
            : vetor.splice(posicaoInicio, excluirQuantidade);

        if (obterElementosExcluidos) {
            return Promise.resolve(elementosExcluidos);
        }
        return Promise.resolve(vetor);
    },
    fatiar: (interpretador: VisitanteComumInterface, vetor: Array<any>, inicio: number, fim: number): Promise<any> => Promise.resolve(vetor.slice(inicio, fim)),
    inclui: (interpretador: VisitanteComumInterface, vetor: Array<any>, elemento: any): Promise<any> => Promise.resolve(vetor.includes(elemento)),
    inverter: (interpretador: VisitanteComumInterface, vetor: Array<any>): Promise<any> => Promise.resolve(vetor.reverse()),
    juntar: (interpretador: VisitanteComumInterface, vetor: Array<any>, separador: string): Promise<any> => Promise.resolve(vetor.join(separador)),
    ordenar: async (interpretador: VisitanteComumInterface, vetor: Array<any>, funcaoOrdenacao: DeleguaFuncao): Promise<any> => {
        if (funcaoOrdenacao !== undefined && funcaoOrdenacao !== null) {
            for (let i = 0; i < vetor.length - 1; i++) {
                for (let j = 1; j < vetor.length; j++) {
                    if (await funcaoOrdenacao.chamar(interpretador, [vetor[j - 1], vetor[j]]) > 0) {
                        const aux = vetor[j];
                        vetor[j] = vetor[j - 1];
                        vetor[j - 1] = aux;
                    }
                }
            }

            return vetor;
        }

        return vetor.sort();
    },
    remover: (interpretador: VisitanteComumInterface, vetor: Array<any>, elemento: any): Promise<any> => {
        const index = vetor.indexOf(elemento);
        if (index !== -1) vetor.splice(index, 1);
        return Promise.resolve(vetor);
    },
    removerPrimeiro: (interpretador: VisitanteComumInterface, vetor: Array<any>): Promise<any> => {
        vetor.shift();
        return Promise.resolve(vetor);
    },
    removerUltimo: (interpretador: VisitanteComumInterface, vetor: Array<any>): Promise<any> => {
        vetor.pop();
        return Promise.resolve(vetor);
    },
    somar: (interpretador: VisitanteComumInterface, vetor: Array<number>): Promise<any> => Promise.resolve(vetor.reduce((a, b) => a + b)),
    tamanho: (interpretador: VisitanteComumInterface, vetor: Array<any>): Promise<any> => Promise.resolve(vetor.length),
};
