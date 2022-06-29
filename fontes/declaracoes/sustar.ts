import { InterpretadorInterface, ResolvedorInterface, SimboloInterface } from "../interfaces";
import { Declaracao } from "./declaracao";


export class Sustar extends Declaracao {
    constructor(simbolo: SimboloInterface) {
        super(Number(simbolo.linha), simbolo.hashArquivo);
    }

    aceitar(visitante: ResolvedorInterface | InterpretadorInterface): any {
        return visitante.visitarExpressaoSustar(this);
    }
}
