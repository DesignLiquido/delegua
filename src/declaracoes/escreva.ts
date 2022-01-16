import { Stmt } from "./stmt";


export class Escreva extends Stmt {
    expressao: any;

    constructor(expressao: any) {
        super();
        this.expressao = expressao;
    }

    aceitar(visitor: any): any {
        return visitor.visitPrintStmt(this);
    }
}
