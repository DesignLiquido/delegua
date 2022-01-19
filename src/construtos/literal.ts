import { Expr } from "./expr";


export class Literal extends Expr {
    valor: any;

    constructor(valor: any) {
        super();
        this.valor = valor;
    }

    aceitar(visitar: any) {
        return visitar.visitarExpressaoLiteral(this);
    }
}
