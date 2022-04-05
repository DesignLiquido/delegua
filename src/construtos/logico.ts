import { Construto } from "./construto";


export class Logico implements Construto {
    linha: number;
    esquerda: any;
    operador: any;
    direita: any;

    constructor(esquerda: any, operador: any, direita: any) {
        this.linha = esquerda.linha;
        this.esquerda = esquerda;
        this.operador = operador;
        this.direita = direita;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoLogica(this);
    }
}
