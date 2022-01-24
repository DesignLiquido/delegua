import { Expr } from "./expr";


export class Literal implements Expr {
    valor: any;

    constructor(valor: any) {
        this.valor = valor;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoLiteral(this);
    }
}
