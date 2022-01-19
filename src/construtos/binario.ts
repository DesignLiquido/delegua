import { Expr } from "./expr";


export class Binario extends Expr {
    esquerda: any;
    operador: any;
    direita: any;

    constructor(esquerda: any, operador: any, direita: any) {
        super();
        this.esquerda = esquerda;
        this.operador = operador;
        this.direita = direita;
    }

    aceitar(visitar: any) {
        return visitar.visitarExpressaoBinaria(this);
    }
}
