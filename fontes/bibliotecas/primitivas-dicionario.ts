import { InterpretadorInterface, PrimitivaInterface } from '../interfaces';

export default {
    chaves: {
        tipoRetorno: 'texto[]',
        argumentos: [],
        implementacao: (interpretador: InterpretadorInterface, valor: object): Promise<any> => {
            return Promise.resolve(Object.keys(valor));
        },
    },
    valores: {
        tipoRetorno: 'qualquer[]',
        argumentos: [],
        implementacao: (interpretador: InterpretadorInterface, valor: object): Promise<any> => {
            return Promise.resolve(Object.values(valor));
        },
    },
} as { [nome: string]: PrimitivaInterface };
