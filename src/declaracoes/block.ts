import { Stmt } from "./stmt";


export class Block extends Stmt {
    declaracoes: any;

    constructor(declaracoes: any) {
        super();
        this.declaracoes = declaracoes;
    }

    aceitar(visitor: any): any {
        return visitor.visitBlockStmt(this);
    }
}
