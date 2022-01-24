import { Expr } from "./expr";


export class Vetor implements Expr {
    valores: any;

    constructor(valores: any) {
        this.valores = valores;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoVetor(this);
    }
}
