import { InterpretadorInterface, ResolvedorInterface } from "../interfaces";
import { Declaracao } from "./declaracao";


export class Escreva extends Declaracao {
    expressao: any;

    constructor(expressao: any) {
        super(expressao.linha);
        this.expressao = expressao;
    }

    aceitar(visitante: ResolvedorInterface | InterpretadorInterface): any {
        return visitante.visitarExpressaoEscreva(this);
    }
}
