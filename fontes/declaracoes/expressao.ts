import { Construto } from "../construtos";
import { InterpretadorInterface, ResolvedorInterface } from "../interfaces";
import { Declaracao } from "./declaracao";


export class Expressao extends Declaracao {
    expressao: Construto;

    constructor(expressao: Construto) {
        super(expressao.linha, expressao.hashArquivo);
        this.expressao = expressao;
    }

    aceitar(visitante: ResolvedorInterface | InterpretadorInterface): any {
        return visitante.visitarDeclaracaoDeExpressao(this);
    }
}
