import { Expr } from "./expr";


export class Dicionario implements Expr {
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
