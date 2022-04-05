import { Construto } from "./construto";


export class Subscript implements Construto {
    linha: number;
    entidadeChamada: any;
    closeBracket: any;
    indice: any;

    constructor(linha: number, entidadeChamada: any, indice: any, closeBracket: any) {
        this.linha = linha;
        this.entidadeChamada = entidadeChamada;
        this.indice = indice;
        this.closeBracket = closeBracket;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoVetorIndice(this);
    }
}
