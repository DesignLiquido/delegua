import { Construto } from "./construto";


export class Vetor implements Construto {
    valores: any;

    constructor(valores: any) {
        this.valores = valores;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoVetor(this);
    }
}
