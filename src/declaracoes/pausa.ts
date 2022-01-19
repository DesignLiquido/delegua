import { Stmt } from "./stmt";


export class Pausa extends Stmt {
    constructor() {
        super();
    }

    aceitar(visitante: any): any {
        return visitante.visitarExpressaoPausa(this);
    }
}
