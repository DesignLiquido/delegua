import { InterpretadorInterface, PrimitivaInterface } from '../interfaces';

export default {
    arredondarParaBaixo: {
        tipoRetorno: 'número',
        implementacao: (interpretador: InterpretadorInterface, valor: number): Promise<number> => {
            return Promise.resolve(Math.floor(valor));
        }
    },
    arredondarParaCima: {
        tipoRetorno: 'número',
        implementacao: (interpretador: InterpretadorInterface, valor: number): Promise<number> => {
            return Promise.resolve(Math.ceil(valor));
        }
    },
} as {[key: string]: PrimitivaInterface };
