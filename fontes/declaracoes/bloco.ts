import { InterpretadorInterface, ResolvedorInterface } from "../interfaces";
import { Declaracao } from "./declaracao";


export class Bloco extends Declaracao {
    declaracoes: any;

    constructor(declaracoes: any) {
        super(0, 0);
        this.declaracoes = declaracoes;
    }

    aceitar(visitante: ResolvedorInterface | InterpretadorInterface): any {
        return visitante.visitarExpressaoBloco(this);
    }
}
