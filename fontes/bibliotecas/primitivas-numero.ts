import { VisitanteComumInterface } from '../interfaces';

export default {
    arredondarParaBaixo: (interpretador: VisitanteComumInterface, valor: number): Promise<number> => {
        return Promise.resolve(Math.floor(valor))
    },
    arredondarParaCima: (interpretador: VisitanteComumInterface, valor: number): Promise<number> => {
        return Promise.resolve(Math.ceil(valor))
    },
};
