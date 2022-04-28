import { SimboloInterface } from "../interfaces";
import { Declaracao } from "./declaracao";


export class Funcao extends Declaracao {
    simbolo: SimboloInterface;
    funcao: any;

    constructor(simbolo: SimboloInterface, funcao: any) {
        super(Number(simbolo.linha), simbolo.hashArquivo);
        this.simbolo = simbolo;
        this.funcao = funcao;
    }

    aceitar(visitante: any): any {
        return visitante.visitarExpressaoFuncao(this);
    }
}
