import { Declaracao } from "./declaracao";


export class Expressao extends Declaracao {
    expressao: any;

    constructor(linha: number, expressao: any) {
        super(linha);
        this.expressao = expressao;
    }

    aceitar(visitante: any): any {
        return visitante.visitarDeclaracaoDeExpressao(this);
    }
}
