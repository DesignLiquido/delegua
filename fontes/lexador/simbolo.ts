import { SimboloInterface } from "../interfaces";

export class Simbolo implements SimboloInterface {
    lexema: string;
    tipo: string;
    literal: string;
    linha: number;    

    constructor(tipo: string, lexema: string, literal: string, linha: number) {
        this.tipo = tipo;
        this.lexema = lexema;
        this.literal = literal;
        this.linha = linha;
    }

    paraTexto(): string {
        return this.tipo + " " + this.lexema + " " + this.literal;
    }
}