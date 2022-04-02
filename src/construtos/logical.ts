import { Construto } from "./construto";


export class Logical implements Construto {
    esquerda: any;
    operador: any;
    direita: any;

    constructor(esquerda: any, operador: any, direita: any) {
        this.esquerda = esquerda;
        this.operador = operador;
        this.direita = direita;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoLogica(this);
    }
}
