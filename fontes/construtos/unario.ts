import { Construto } from './construto';

export class Unario implements Construto {
    linha: number;
    hashArquivo?: number;

    operador: any;
    direita: any;

    constructor(hashArquivo: number, operador: any, direita: any) {
        this.linha = operador.linha;
        this.hashArquivo = hashArquivo;

        this.operador = operador;
        this.direita = direita;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoUnaria(this);
    }
}
