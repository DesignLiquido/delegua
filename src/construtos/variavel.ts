import { SimboloInterface } from "../interfaces";
import { Construto } from "./construto";


export class Variavel implements Construto {
    linha: number;
    simbolo: SimboloInterface;

    constructor(linha: number, simbolo: SimboloInterface) {
        this.linha = linha;
        this.simbolo = simbolo;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoDeVariavel(this);
    }
}
