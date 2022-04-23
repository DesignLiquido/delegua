import { SimboloInterface } from "../interfaces";
import { Construto } from "./construto";


export class Super implements Construto {
    linha: number;
    hashArquivo?: number;

    simboloChave: SimboloInterface;
    metodo: any;

    constructor(hashArquivo: number, simboloChave: SimboloInterface, metodo: any) {
        this.linha = Number(simboloChave.linha);
        this.hashArquivo = hashArquivo;

        this.simboloChave = simboloChave;
        this.metodo = metodo;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoSuper(this);
    }
}
