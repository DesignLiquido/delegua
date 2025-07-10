import { InterpretadorInterface, PrimitivaInterface } from '../interfaces';

export default {
    arredondarParaBaixo: {
        tipoRetorno: 'número',
        argumentos: [],
        implementacao: (interpretador: InterpretadorInterface, valor: number): Promise<number> => {
            return Promise.resolve(Math.floor(valor));
        },
    },
    arredondarParaCima: {
        tipoRetorno: 'número',
        argumentos: [],
        implementacao: (interpretador: InterpretadorInterface, valor: number): Promise<number> => {
            return Promise.resolve(Math.ceil(valor));
        },
    },
    absoluto: {
        tipoRetorno: 'número',
        argumentos: [],
        implementacao: (interpretador: InterpretadorInterface, valor: number): Promise<number> => {
            return Promise.resolve(Math.abs(valor));
        },
    },
} as { [nome: string]: PrimitivaInterface };
