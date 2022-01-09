import { Expr } from "./expr";


export class Isto extends Expr {
    palavraChave: any;

    constructor(palavraChave?: any) {
        super();
        this.palavraChave = palavraChave;
    }

    aceitar(visitor: any) {
        return visitor.visitThisExpr(this);
    }
}
