import { SimboloInterface } from "../interfaces";
import { Declaracao } from "./declaracao";


export class Retorna extends Declaracao {
    simboloChave: SimboloInterface;
    valor: any;

    constructor(simboloChave: SimboloInterface, valor: any) {
        super(Number(simboloChave.linha));
        this.simboloChave = simboloChave;
        this.valor = valor;
    }

    aceitar(visitante: any): any {
        return visitante.visitarExpressaoRetornar(this);
    }
}
