import { Stmt } from "./stmt";


export class Enquanto extends Stmt {
    condicao: any;
    corpo: any;

    constructor(condicao: any, corpo: any) {
        super();
        this.condicao = condicao;
        this.corpo = corpo;
    }

    aceitar(visitante: any): any {
        return visitante.visitarExpressaoEnquanto(this);
    }
}
