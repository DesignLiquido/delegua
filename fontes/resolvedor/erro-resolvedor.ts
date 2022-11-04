import { SimboloInterface } from '../interfaces';

export class ErroResolvedor extends Error {
    simbolo: SimboloInterface;

    constructor(simbolo: SimboloInterface, mensagem: string) {
        super(mensagem);
        this.simbolo = simbolo;
        Object.setPrototypeOf(this, ErroResolvedor.prototype);
    }
}
