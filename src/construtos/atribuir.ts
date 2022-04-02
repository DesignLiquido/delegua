import { Construto } from "./construto";


export class Atribuir implements Construto {
    nome: any;
    valor: any;

    constructor(nome: any, valor: any) {
        this.nome = nome;
        this.valor = valor;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoDeAtribuicao(this);
    }
}
