import { Construto } from "./construto";


export class Vetor implements Construto {
    linha: number;
    valores: any;

    constructor(linha: number, valores: any) {
        this.linha = linha;
        this.valores = valores;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoVetor(this);
    }
}
