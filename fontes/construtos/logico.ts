import { Construto } from './construto';

export class Logico implements Construto {
    linha: number;
    hashArquivo?: number;

    esquerda: any;
    operador: any;
    direita: any;

    constructor(
        hashArquivo: number,
        esquerda: any,
        operador: any,
        direita: any
    ) {
        this.linha = esquerda.linha;
        this.hashArquivo = hashArquivo;

        this.esquerda = esquerda;
        this.operador = operador;
        this.direita = direita;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoLogica(this);
    }
}
