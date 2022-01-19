import { Expr } from "./expr";


export class Subscript extends Expr {
    callee: any;
    closeBracket: any;
    indice: any;

    constructor(callee: any, indice: any, closeBracket: any) {
        super();
        this.callee = callee;
        this.indice = indice;
        this.closeBracket = closeBracket;
    }

    aceitar(visitar: any) {
        return visitar.visitarExpressaoVetorIndice(this);
    }
}
