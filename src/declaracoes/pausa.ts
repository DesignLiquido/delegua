import { Stmt } from "./stmt";


export class Pausa extends Stmt {
    constructor() {
        super();
    }

    aceitar(visitor: any): any {
        return visitor.visitBreakStmt(this);
    }
}
