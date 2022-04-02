import { Construto } from "./construto";


export class Subscript implements Construto {
    entidadeChamada: any;
    closeBracket: any;
    indice: any;

    constructor(entidadeChamada: any, indice: any, closeBracket: any) {
        this.entidadeChamada = entidadeChamada;
        this.indice = indice;
        this.closeBracket = closeBracket;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoVetorIndice(this);
    }
}
