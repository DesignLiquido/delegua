import { Expr } from "./expr";


export class Vetor extends Expr {
    valores: any;

    constructor(valores: any) {
        super();
        this.valores = valores;
    }

    aceitar(visitar: any) {
        return visitar.visitarExpressaoVetor(this);
    }
}
