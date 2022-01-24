import { Expr } from "./expr";


export class Variavel implements Expr {
    nome: any;

    constructor(nome: any) {
        this.nome = nome;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoDeVariavel(this);
    }
}
