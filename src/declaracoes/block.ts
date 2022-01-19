import { Stmt } from "./stmt";


export class Bloco extends Stmt {
    declaracoes: any;

    constructor(declaracoes: any) {
        super();
        this.declaracoes = declaracoes;
    }

    aceitar(visitante: any): any {
        return visitante.visitarExpressaoBloco(this);
    }
}
