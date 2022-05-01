import { Construto } from "../construtos";
import { InterpretadorInterface } from "../interfaces";
import { Declaracao } from "./declaracao";


export class Escreva extends Declaracao {
    expressao: Construto;

    constructor(expressao: Construto) {
        super(expressao.linha, expressao.hashArquivo);
        this.expressao = expressao;
    }

    aceitar(visitante: InterpretadorInterface): any {
        return visitante.visitarExpressaoEscreva(this);
    }
}
