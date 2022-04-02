import { Construto } from "./construto";


export class Variavel implements Construto {
    nome: any;

    constructor(nome: any) {
        this.nome = nome;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoDeVariavel(this);
    }
}
