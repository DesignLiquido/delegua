import { Expr } from "./expr";


export class Atribuir implements Expr {
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
