import { Stmt } from "./stmt";


export class Função extends Stmt {
    nome: string;
    função: any;

    constructor(nome: any, função: any) {
        super();
        this.nome = nome;
        this.função = função;
    }

    aceitar(visitante: any): any {
        return visitante.visitarExpressaoFuncao(this);
    }
}
