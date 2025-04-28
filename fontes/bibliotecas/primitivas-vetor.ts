import { DeleguaFuncao } from '../interpretador/estruturas';
import { InterpretadorInterface, PrimitivaInterface, VisitanteComumInterface } from '../interfaces';

export default {
    adicionar: {
        tipoRetorno: 'qualquer[]',
        implementacao: (interpretador: InterpretadorInterface, vetor: Array<any>, elemento: any): Promise<any> => {
            vetor.push(elemento);
            return Promise.resolve(vetor);
        }
    },
    concatenar: {
        tipoRetorno: 'qualquer[]',
        implementacao: (interpretador: InterpretadorInterface, vetor: Array<any>, outroVetor: Array<any>): Promise<any> => {
            return Promise.resolve(vetor.concat(outroVetor));
        }
    },
    empilhar: {
        tipoRetorno: 'qualquer[]',
        implementacao: (interpretador: InterpretadorInterface, vetor: Array<any>, elemento: any): Promise<any> => {
            vetor.push(elemento);
            return Promise.resolve(vetor);
        }
    },
    encaixar: {
        tipoRetorno: 'qualquer[]',
        implementacao: (
            interpretador: InterpretadorInterface,
            vetor: Array<any>,
            inicio: number,
            excluirQuantidade?: number,
            ...items: any[]
        ): Promise<any> => {
            let elementos = [];

            if (excluirQuantidade || excluirQuantidade === 0) {
                elementos = !items.length
                    ? vetor.splice(inicio, excluirQuantidade)
                    : vetor.splice(inicio, excluirQuantidade, ...items);
            } else {
                elementos = !items.length ? vetor.splice(inicio) : vetor.splice(inicio, ...items);
            }
            return Promise.resolve(elementos);
        }
    },
    fatiar: {
        tipoRetorno: 'qualquer[]',
        implementacao: (interpretador: InterpretadorInterface, vetor: Array<any>, inicio: number, fim: number): Promise<any> =>
            Promise.resolve(vetor.slice(inicio, fim)),
    },
    filtrarPor: {
        tipoRetorno: 'qualquer[]',
        implementacao: async (
            interpretador: InterpretadorInterface,
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
        }
    },
    inclui: {
        tipoRetorno: 'lógico',
        implementacao: (interpretador: InterpretadorInterface, vetor: Array<any>, elemento: any): Promise<any> =>
            Promise.resolve(vetor.includes(elemento))
    },
    inverter: {
        tipoRetorno: 'qualquer[]',
        implementacao: (interpretador: InterpretadorInterface, vetor: Array<any>): Promise<any> =>
            Promise.resolve(vetor.reverse())
    },
    juntar: {
        tipoRetorno: 'texto',
        implementacao: (interpretador: InterpretadorInterface, vetor: Array<any>, separador: string): Promise<any> =>
            Promise.resolve(vetor.join(separador))
    },
    mapear: {
        tipoRetorno: 'qualquer[]',
        implementacao: async (interpretador: InterpretadorInterface, vetor: Array<any>, funcao: DeleguaFuncao): Promise<any> => {
            if (funcao === undefined || funcao === null) {
                return Promise.reject("É necessário passar uma função para o método 'mapear'");
            }
    
            const retorno = [];
            for (let elemento of vetor) {
                let resultado = await funcao.chamar(interpretador, [elemento]);
                retorno.push(resultado);
            }
    
            return retorno;
        }
    },
    ordenar: {
        tipoRetorno: 'qualquer[]',
        implementacao: async (
            interpretador: InterpretadorInterface,
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
        }
    },
    remover: {
        tipoRetorno: 'qualquer[]',
        implementacao: (interpretador: InterpretadorInterface, vetor: Array<any>, elemento: any): Promise<any> => {
            const index = vetor.indexOf(elemento);
            if (index !== -1) vetor.splice(index, 1);
            return Promise.resolve(vetor);
        }
    },
    removerPrimeiro: {
        tipoRetorno: 'qualquer',
        implementacao: (interpretador: InterpretadorInterface, vetor: Array<any>): Promise<any> => {
            let elemento = vetor.shift();
            return Promise.resolve(elemento);
        }
    },
    removerUltimo: {
        tipoRetorno: 'qualquer',
        implementacao: (interpretador: InterpretadorInterface, vetor: Array<any>): Promise<any> => {
            let elemento = vetor.pop();
            return Promise.resolve(elemento);
        }
    },
    somar: {
        tipoRetorno: 'qualquer',
        implementacao: (interpretador: InterpretadorInterface, vetor: Array<number | { valor: number }>): Promise<number | { valor: number }> => {
            return Promise.resolve(
                vetor.reduce((acc: number, item) => acc + (typeof item === 'number' ? item : item.valor), 0)
            );
        }
    },
    tamanho: {
        tipoRetorno: 'número',
        implementacao: (interpretador: InterpretadorInterface, vetor: Array<any>): Promise<any> => Promise.resolve(vetor.length)
    }
} as { [key: string]: PrimitivaInterface };
