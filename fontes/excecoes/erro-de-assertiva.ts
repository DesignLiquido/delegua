import { SimboloInterface } from '../interfaces';
import { ErroEmTempoDeExecucao } from './erro-em-tempo-de-execucao';

export class ErroDeAssertiva extends ErroEmTempoDeExecucao {
    esperado?: any;
    obtido?: any;

    constructor(simbolo?: SimboloInterface, mensagem?: string, esperado?: any, obtido?: any) {
        super(simbolo, mensagem);
        this.esperado = esperado;
        this.obtido = obtido;
        Object.setPrototypeOf(this, ErroDeAssertiva.prototype);
    }
}
