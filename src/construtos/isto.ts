import { Expr } from "./expr";


export class Isto extends Expr {
    palavraChave: any;

    constructor(palavraChave?: any) {
        super();
        this.palavraChave = palavraChave;
    }

    aceitar(visitar: any) {
        return visitar.visitarExpressaoIsto(this);
    }
}
