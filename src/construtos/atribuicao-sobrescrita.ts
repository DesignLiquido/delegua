import { Construto } from "./construto";


export class AtribuicaoSobrescrita implements Construto {
    objeto: any;
    valor: any;
    indice: any;

    constructor(objeto: any, indice: any, valor: any) {
        this.objeto = objeto;
        this.indice = indice;
        this.valor = valor;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoAtribuicaoSobrescrita(this);
    }
}
