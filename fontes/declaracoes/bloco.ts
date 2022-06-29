import { InterpretadorInterface, ResolvedorInterface } from "../interfaces";
import { Declaracao } from "./declaracao";


export class Bloco extends Declaracao {
    declaracoes: any;

    constructor(hashArquivo: number, linha: number, declaracoes: any) {
        super(linha, hashArquivo);
        this.declaracoes = declaracoes;
    }

    aceitar(visitante: ResolvedorInterface | InterpretadorInterface): any {
        return visitante.visitarExpressaoBloco(this);
    }
}
