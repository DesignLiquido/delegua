import { SimboloInterface } from '../interfaces';

export class Simbolo implements SimboloInterface {
    lexema: string;
    tipo: string;
    literal: any;
    linha: number;
    hashArquivo: number;
    colunaInicio: number;
    colunaFim: number;
    delimitadorTexto?: "'" | '"';
    ehNumeroReal?: boolean;

    constructor(
        tipo: string,
        lexema: string,
        literal: any,
        linha: number,
        hashArquivo: number,
        colunaInicio: number = 0,
        colunaFim: number = 0,
        delimitadorTexto?: "'" | '"',
        ehNumeroReal?: boolean
    ) {
        this.tipo = tipo;
        this.lexema = lexema;
        this.literal = literal;
        this.linha = linha;
        this.hashArquivo = hashArquivo;
        this.colunaInicio = colunaInicio;
        this.colunaFim = colunaFim;
        this.delimitadorTexto = delimitadorTexto;
        this.ehNumeroReal = ehNumeroReal;
    }

    paraTexto(): string {
        return this.tipo + ' ' + this.lexema + ' ' + this.literal;
    }
}
