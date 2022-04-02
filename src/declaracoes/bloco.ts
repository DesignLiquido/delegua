import { Declaracao } from "./declaracao";


export class Bloco extends Declaracao {
    declaracoes: any;

    constructor(declaracoes: any) {
        super();
        this.declaracoes = declaracoes;
    }

    aceitar(visitante: any): any {
        return visitante.visitarExpressaoBloco(this);
    }
}
