import { DeleguaFuncao } from '../estruturas';
import { VisitanteComumInterface } from '../interfaces';

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
        inicio: number,
        excluirQuantidade: number,
        ...items: any[]
    ): Promise<any> => {
        const elementos = !items.length
            ? vetor.splice(inicio, excluirQuantidade)
            : vetor.splice(inicio, excluirQuantidade, ...items);
        return Promise.resolve(elementos);
    },
    fatiar: (interpretador: VisitanteComumInterface, vetor: Array<any>, inicio: number, fim: number): Promise<any> =>
        Promise.resolve(vetor.slice(inicio, fim)),
    filtrarPor: async (
        interpretador: VisitanteComumInterface,
        vetor: Array<any>,
        funcao: DeleguaFuncao
    ): Promise<any> => {
        if (funcao === undefined || funcao === null) {
            return Promise.reject("É necessário passar uma função para o método 'filtrarPor'");
        }

        const retorno = [];
        for (let elemento of vetor) {
            if (await funcao.chamar(interpretador, [elemento])) {
                retorno.push(elemento);
            }
        }

        return retorno;
    },
    inclui: (interpretador: VisitanteComumInterface, vetor: Array<any>, elemento: any): Promise<any> =>
        Promise.resolve(vetor.includes(elemento)),
    inverter: (interpretador: VisitanteComumInterface, vetor: Array<any>): Promise<any> =>
        Promise.resolve(vetor.reverse()),
    juntar: (interpretador: VisitanteComumInterface, vetor: Array<any>, separador: string): Promise<any> =>
        Promise.resolve(vetor.join(separador)),
    mapear: async (interpretador: VisitanteComumInterface, vetor: Array<any>, funcao: DeleguaFuncao): Promise<any> => {
        if (funcao === undefined || funcao === null) {
            return Promise.reject("É necessário passar uma função para o método 'mapear'");
        }

        const retorno = [];
        for (let elemento of vetor) {
            let resultado = await funcao.chamar(interpretador, [elemento]);
            retorno.push(resultado);
        }

        return retorno;
    },
    ordenar: async (
        interpretador: VisitanteComumInterface,
        vetor: Array<any>,
        funcaoOrdenacao: DeleguaFuncao
    ): Promise<any> => {
        if (funcaoOrdenacao !== undefined && funcaoOrdenacao !== null) {
            for (let i = 0; i < vetor.length - 1; i++) {
                for (let j = 1; j < vetor.length; j++) {
                    if ((await funcaoOrdenacao.chamar(interpretador, [vetor[j - 1], vetor[j]])) > 0) {
                        const aux = vetor[j];
                        vetor[j] = vetor[j - 1];
                        vetor[j - 1] = aux;
                    }
                }
            }

            return vetor;
        }

        if (!vetor.every((v) => typeof v === 'number')) {
            return vetor.sort();
        }

        return vetor.sort((a, b) => a - b);
    },
    remover: (interpretador: VisitanteComumInterface, vetor: Array<any>, elemento: any): Promise<any> => {
        const index = vetor.indexOf(elemento);
        if (index !== -1) vetor.splice(index, 1);
        return Promise.resolve(vetor);
    },
    removerPrimeiro: (interpretador: VisitanteComumInterface, vetor: Array<any>): Promise<any> => {
        let elemento = vetor.shift();
        return Promise.resolve(elemento);
    },
    removerUltimo: (interpretador: VisitanteComumInterface, vetor: Array<any>): Promise<any> => {
        let elemento = vetor.pop();
        return Promise.resolve(elemento);
    },
    somar: (interpretador: VisitanteComumInterface, vetor: Array<number>): Promise<any> =>
        Promise.resolve(vetor.reduce((a, b) => a + b)),
    tamanho: (interpretador: VisitanteComumInterface, vetor: Array<any>): Promise<any> => Promise.resolve(vetor.length),
};
