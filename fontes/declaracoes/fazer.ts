import { Declaracao } from "./declaracao";


export class Fazer extends Declaracao {
    caminhoFazer: any;
    condicaoEnquanto: any;

    constructor(caminhoFazer: any, condicaoEnquanto: any) {
        super(0, 0);
        this.caminhoFazer = caminhoFazer;
        this.condicaoEnquanto = condicaoEnquanto;
    }

    aceitar(visitante: any): any {
        return visitante.visitarExpressaoFazer(this);
    }
}
