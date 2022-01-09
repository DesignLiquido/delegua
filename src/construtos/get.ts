import { Expr } from "./expr";


export class Get extends Expr {
    objeto: any;
    nome: any;

    constructor(objeto: any, nome: any) {
        super();
        this.objeto = objeto;
        this.nome = nome;
    }

    aceitar(visitor: any) {
        return visitor.visitGetExpr(this);
    }
}
