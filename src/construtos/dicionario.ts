import { Construto } from "./construto";


export class Dicionario implements Construto {
    linha: number;
    chaves: any;
    valores: any;

    constructor(linha: number, chaves: any, valores: any) {
        this.linha = linha;
        this.chaves = chaves;
        this.valores = valores;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoDicionario(this);
    }
}
