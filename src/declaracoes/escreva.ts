import { Declaracao } from "./declaracao";


export class Escreva extends Declaracao {
    expressao: any;

    constructor(expressao: any) {
        super(expressao.linha);
        this.expressao = expressao;
    }

    aceitar(visitante: any): any {
        return visitante.visitarExpressaoEscreva(this);
    }
}
