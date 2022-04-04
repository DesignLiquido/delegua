import { Declaracao } from "./declaracao";


export class Enquanto extends Declaracao {
    condicao: any;
    corpo: any;

    constructor(condicao: any, corpo: any) {
        super(0);
        this.condicao = condicao;
        this.corpo = corpo;
    }

    aceitar(visitante: any): any {
        return visitante.visitarExpressaoEnquanto(this);
    }
}
