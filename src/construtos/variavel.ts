import { Expr } from "./expr";


export class Variavel extends Expr {
    nome: any;

    constructor(nome: any) {
        super();
        this.nome = nome;
    }

    aceitar(visitar: any) {
        return visitar.visitarExpressaoDeVariavel(this);
    }
}
