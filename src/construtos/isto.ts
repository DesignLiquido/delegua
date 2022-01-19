import { Expr } from "./expr";


export class Isto extends Expr {
    palavraChave: any;

    constructor(palavraChave?: any) {
        super();
        this.palavraChave = palavraChave;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoIsto(this);
    }
}
