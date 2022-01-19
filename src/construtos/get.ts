import { Expr } from "./expr";


export class Get extends Expr {
    objeto: any;
    nome: any;

    constructor(objeto: any, nome: any) {
        super();
        this.objeto = objeto;
        this.nome = nome;
    }

    aceitar(visitar: any) {
        return visitar.visitarExpressaoObter(this);
    }
}
