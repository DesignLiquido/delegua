import { Stmt } from "./stmt";


export class Retorna extends Stmt {
    palavraChave: string;
    valor: any;

    constructor(palavraChave: any, valor: any) {
        super();
        this.palavraChave = palavraChave;
        this.valor = valor;
    }

    aceitar(visitor: any): any {
        return visitor.visitReturnStmt(this);
    }
}
