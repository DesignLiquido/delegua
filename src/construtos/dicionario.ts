import { Construto } from "./construto";


export class Dicionario implements Construto {
    chaves: any;
    valores: any;

    constructor(chaves: any, valores: any) {
        this.chaves = chaves;
        this.valores = valores;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoDicionario(this);
    }
}
