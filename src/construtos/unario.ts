import { Expr } from "./expr";


export class Unario extends Expr {
    operador: any;
    direita: any;

    constructor(operador: any, direita: any) {
        super();
        this.operador = operador;
        this.direita = direita;
    }

    aceitar(visitor: any) {
        return visitor.visitarExpressaoUnaria(this);
    }
}
