import { SimboloInterface } from '../interfaces';

export class Simbolo implements SimboloInterface {
    lexema: string;
    tipo: string;
    literal: any;
    linha: number;
    hashArquivo: number;

    constructor(
        tipo: string,
        lexema: string,
        literal: any,
        linha: number,
        hashArquivo: number
    ) {
        this.tipo = tipo;
        this.lexema = lexema;
        this.literal = literal;
        this.linha = linha;
        this.hashArquivo = hashArquivo;
    }

    paraTexto(): string {
        return this.tipo + ' ' + this.lexema + ' ' + this.literal;
    }
}
