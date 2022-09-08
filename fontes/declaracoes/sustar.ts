import { InterpretadorInterface, SimboloInterface } from "../interfaces";
import { Declaracao } from "./declaracao";


export class Sustar extends Declaracao {
    constructor(simbolo: SimboloInterface) {
        super(Number(simbolo.linha), simbolo.hashArquivo);
    }

    aceitar(visitante: InterpretadorInterface): any {
        return visitante.visitarExpressaoSustar(this);
    }
}
