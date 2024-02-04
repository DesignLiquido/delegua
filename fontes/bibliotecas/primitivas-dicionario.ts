import { VisitanteComumInterface } from '../interfaces';

export default {
    chaves: (interpretador: VisitanteComumInterface, valor: Object): Promise<any> => {
        return Promise.resolve(Object.keys(valor))
    },
    valores: (interpretador: VisitanteComumInterface, valor: Object): Promise<any> => {
        return Promise.resolve(Object.values(valor))
    },
};
