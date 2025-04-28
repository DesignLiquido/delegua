import { InterpretadorInterface, PrimitivaInterface } from '../interfaces';

export default {
    chaves: {
        tipoRetorno: 'texto[]',
        implementacao: (interpretador: InterpretadorInterface, valor: Object): Promise<any> => {
            return Promise.resolve(Object.keys(valor));
        }
    },
    valores: {
        tipoRetorno: 'qualquer[]',
        implementacao: (interpretador: InterpretadorInterface, valor: Object): Promise<any> => {
            return Promise.resolve(Object.values(valor));
        }
    },
} as {[key: string]: PrimitivaInterface };
