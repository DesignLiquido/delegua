import { Stmt } from "./stmt";


export class Funcao extends Stmt {
    nome: string;
    funcao: any;

    constructor(nome: any, funcao: any) {
        super();
        this.nome = nome;
        this.funcao = funcao;
    }

    aceitar(visitor: any): any {
        return visitor.visitarExpressaoFuncao(this);
    }
}
