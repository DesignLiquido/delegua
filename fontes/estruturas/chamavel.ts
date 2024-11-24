import { SimboloInterface, VisitanteComumInterface } from '../interfaces';
import { ArgumentoInterface } from '../interpretador/argumento-interface';

export abstract class Chamavel {
    valorAridade: number;

    aridade(): number {
        return this.valorAridade;
    }

    async chamar(
        visitante?: VisitanteComumInterface,
        argumentos?: ArgumentoInterface[],
        simbolo?: SimboloInterface
    ): Promise<any> {
        return Promise.reject(new Error('Este método não deveria ser chamado.'));
    }
}
