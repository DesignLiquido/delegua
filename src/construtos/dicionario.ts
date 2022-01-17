import { Expr } from "./expr";


export class Dicionario extends Expr {
    chaves: any;
    valores: any;

    constructor(chaves: any, valores: any) {
        super();
        this.chaves = chaves;
        this.valores = valores;
    }

    aceitar(visitor: any) {
        return visitor.visitarExpressaoDicionario(this);
    }
}
