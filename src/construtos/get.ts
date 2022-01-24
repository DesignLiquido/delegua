import { Expr } from "./expr";


export class Get implements Expr {
    objeto: any;
    nome: any;

    constructor(objeto: any, nome: any) {
        this.objeto = objeto;
        this.nome = nome;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoObter(this);
    }
}
