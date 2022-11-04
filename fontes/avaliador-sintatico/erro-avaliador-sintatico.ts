import { SimboloInterface } from '../interfaces';

export class ErroAvaliadorSintatico extends Error {
    simbolo: SimboloInterface;

    constructor(simbolo: SimboloInterface, mensagem: string) {
        super(mensagem);
        this.simbolo = simbolo;
        Object.setPrototypeOf(this, ErroAvaliadorSintatico.prototype);
    }
}
