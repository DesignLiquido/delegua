import { SimboloInterface } from "../interfaces";
import { Construto } from "./construto";


export class Variavel implements Construto {
    linha: number;
    hashArquivo?: number;

    simbolo: SimboloInterface;

    constructor(hashArquivo: number, simbolo: SimboloInterface) {
        this.linha = Number(simbolo.linha);
        this.hashArquivo = hashArquivo;
        
        this.simbolo = simbolo;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoDeVariavel(this);
    }
}
