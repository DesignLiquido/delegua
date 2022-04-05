import { SimboloInterface } from "../interfaces";
import { Construto } from "./construto";


export class Atribuir implements Construto {
    linha: number;
    simbolo: SimboloInterface;
    valor: any;

    constructor(simbolo: SimboloInterface, valor: any) {
        this.linha = Number(simbolo.linha);
        this.simbolo = simbolo;
        this.valor = valor;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoDeAtribuicao(this);
    }
}
