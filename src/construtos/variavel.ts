import { Expr } from "./expr";


export class Variavel extends Expr {
    nome: any;

    constructor(nome: any) {
        super();
        this.nome = nome;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoDeVariavel(this);
    }
}
