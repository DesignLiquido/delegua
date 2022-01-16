import { Stmt } from "./stmt";


export class Continua extends Stmt {
    constructor() {
        super();
    }

    aceitar(visitor: any): any {
        return visitor.visitContinueStmt(this);
    }
}
