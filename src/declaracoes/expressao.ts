import { Declaracao } from "./declaracao";


export class Expressao extends Declaracao {
    expressao: any;

    constructor(expressao: any) {
        super();
        this.expressao = expressao;
    }

    aceitar(visitante: any): any {
        return visitante.visitarDeclaracaoDeExpressao(this);
    }
}
