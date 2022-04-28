import { Construto } from "../construtos";
import { Declaracao } from "./declaracao";


export class Expressao extends Declaracao {
    expressao: Construto;

    constructor(expressao: Construto) {
        super(expressao.linha, 0);
        this.expressao = expressao;
    }

    aceitar(visitante: any): any {
        return visitante.visitarDeclaracaoDeExpressao(this);
    }
}
