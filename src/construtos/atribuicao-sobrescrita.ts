import { Construto } from "./construto";


export class AtribuicaoSobrescrita implements Construto {
    linha: number;
    objeto: any;
    valor: any;
    indice: any;

    constructor(linha: number, objeto: any, indice: any, valor: any) {
        this.linha = linha;
        this.objeto = objeto;
        this.indice = indice;
        this.valor = valor;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoAtribuicaoSobrescrita(this);
    }
}
