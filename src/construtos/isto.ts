import { Expr } from "./expr";


export class Isto implements Expr {
    palavraChave: any;

    constructor(palavraChave?: any) {
        this.palavraChave = palavraChave;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoIsto(this);
    }
}
