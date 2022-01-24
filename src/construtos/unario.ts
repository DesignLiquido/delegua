import { Expr } from "./expr";


export class Unario implements Expr {
    operador: any;
    direita: any;

    constructor(operador: any, direita: any) {
        this.operador = operador;
        this.direita = direita;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoUnaria(this);
    }
}
