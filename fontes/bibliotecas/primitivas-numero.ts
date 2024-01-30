import { VisitanteComumInterface } from '../interfaces';

export default {
    arredondarParaCima: (interpretador: VisitanteComumInterface, valor: number): Promise<number> => {
        return Promise.resolve(Math.ceil(valor))
    },
};
