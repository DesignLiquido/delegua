import { Expr } from "./expr";


export class Subscript implements Expr {
    callee: any;
    closeBracket: any;
    indice: any;

    constructor(callee: any, indice: any, closeBracket: any) {
        this.callee = callee;
        this.indice = indice;
        this.closeBracket = closeBracket;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoVetorIndice(this);
    }
}
