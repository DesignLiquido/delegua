import { InterpretadorInterface, SimboloInterface } from "../interfaces";
import { Declaracao } from "./declaracao";


export class Var extends Declaracao {
    simbolo: SimboloInterface;
    inicializador: any;

    constructor(simbolo: SimboloInterface, inicializador: any) {
        super(Number(simbolo.linha), simbolo.hashArquivo);
        this.simbolo = simbolo;
        this.inicializador = inicializador;
    }

    aceitar(visitante: InterpretadorInterface): any {
        return visitante.visitarExpressaoVar(this);
    }
}
