import { SimboloInterface } from "../interfaces";
import { Construto } from "./construto";


export class Variavel implements Construto {
    simbolo: SimboloInterface;

    constructor(simbolo: SimboloInterface) {
        this.simbolo = simbolo;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoDeVariavel(this);
    }
}
