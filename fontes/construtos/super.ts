import { SimboloInterface } from "../interfaces";
import { Construto } from "./construto";


export class Super implements Construto {
    linha: number;
    simboloChave: SimboloInterface;
    metodo: any;

    constructor(simboloChave: SimboloInterface, metodo: any) {
        this.linha = Number(simboloChave.linha);
        this.simboloChave = simboloChave;
        this.metodo = metodo;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoSuper(this);
    }
}
