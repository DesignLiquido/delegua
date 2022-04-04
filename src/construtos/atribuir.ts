import { SimboloInterface } from "../interfaces";
import { Construto } from "./construto";


export class Atribuir implements Construto {
    simbolo: SimboloInterface;
    valor: any;

    constructor(nome: SimboloInterface, valor: any) {
        this.simbolo = nome;
        this.valor = valor;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoDeAtribuicao(this);
    }
}
