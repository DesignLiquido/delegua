import { InterpretadorInterface, ResolvedorInterface, SimboloInterface } from "../interfaces";
import { Construto } from "./construto";


export class Variavel implements Construto {
    linha: number;
    simbolo: SimboloInterface;

    constructor(simbolo: SimboloInterface) {
        this.linha = Number(simbolo.linha);
        this.simbolo = simbolo;
    }

    aceitar(visitante: ResolvedorInterface | InterpretadorInterface) {
        return visitante.visitarExpressaoDeVariavel(this);
    }
}
