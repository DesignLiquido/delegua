import { SimboloInterface } from "../interfaces";
import { Construto } from "./construto";


export class Variavel implements Construto {
    linha: number;
    simbolo: SimboloInterface;

    constructor(simbolo: SimboloInterface) {
        this.linha = Number(simbolo.linha);
        this.simbolo = simbolo;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoDeVariavel(this);
    }
}
