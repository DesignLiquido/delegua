import { Expr } from "./expr";


export class Binario implements Expr {
    esquerda: any;
    operador: any;
    direita: any;

    constructor(esquerda: any, operador: any, direita: any) {
        this.esquerda = esquerda;
        this.operador = operador;
        this.direita = direita;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoBinaria(this);
    }
}
