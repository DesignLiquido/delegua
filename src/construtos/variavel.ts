import { Expr } from "./expr";


export class Variavel extends Expr {
    nome: any;

    constructor(nome: any) {
        super();
        this.nome = nome;
    }

    aceitar(visitor: any) {
        return visitor.visitVariableExpr(this);
    }
}
