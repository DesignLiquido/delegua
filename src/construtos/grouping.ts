import { Expr } from "./expr";


export class Grouping extends Expr {
    expressao: any;

    constructor(expressao: any) {
        super();
        this.expressao = expressao;
    }

    aceitar(visitor: any) {
        return visitor.visitGroupingExpr(this);
    }
}
