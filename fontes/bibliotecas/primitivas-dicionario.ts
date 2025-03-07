import { PrimitivaInterface, VisitanteComumInterface } from '../interfaces';

export default {
    chaves: {
        tipoRetorno: 'texto[]',
        implementacao: (interpretador: VisitanteComumInterface, valor: Object): Promise<any> => {
            return Promise.resolve(Object.keys(valor));
        }
    },
    valores: {
        tipoRetorno: 'qualquer[]',
        implementacao: (interpretador: VisitanteComumInterface, valor: Object): Promise<any> => {
            return Promise.resolve(Object.values(valor));
        }
    },
} as {[key: string]: PrimitivaInterface };
