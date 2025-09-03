import { SimboloInterface } from '../interfaces';

export class ErroAvaliadorSintatico extends Error {
    simbolo: SimboloInterface;
    hashArquivo: number;
    linha: number;

    constructor(simbolo: SimboloInterface, mensagem: string) {
        super(mensagem);
        this.simbolo = simbolo;
        this.hashArquivo = simbolo.hashArquivo;
        this.linha = simbolo.linha;
        Object.setPrototypeOf(this, ErroAvaliadorSintatico.prototype);
    }
}
