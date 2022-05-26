import { InterpretadorInterface, ResolvedorInterface, SimboloInterface } from "../interfaces";
import { Declaracao } from "./declaracao";


export class Funcao extends Declaracao {
    simbolo: SimboloInterface;
    funcao: any;

    constructor(simbolo: SimboloInterface, funcao: any) {
        super(Number(simbolo.linha));
        this.simbolo = simbolo;
        this.funcao = funcao;
    }

    aceitar(visitante: ResolvedorInterface | InterpretadorInterface): any {
        return visitante.visitarExpressaoFuncao(this);
    }
}
