import { Declaracao } from "./declaracao";


export class Bloco extends Declaracao {
    declaracoes: any;

    constructor(declaracoes: any) {
        super(0, 0);
        this.declaracoes = declaracoes;
    }

    aceitar(visitante: any): any {
        return visitante.visitarExpressaoBloco(this);
    }
}
