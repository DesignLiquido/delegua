import { InterpretadorInterface, SimboloInterface } from '../../interfaces';
import { ArgumentoInterface } from '../argumento-interface';

export abstract class Chamavel {
    valorAridade: number = 0;

    aridade(): number {
        return this.valorAridade;
    }

    async chamar(
        visitante?: InterpretadorInterface,
        argumentos?: ArgumentoInterface[],
        simbolo?: SimboloInterface | null
    ): Promise<any> {
        return Promise.reject(new Error('Este método não deveria ser chamado.'));
    }
}
