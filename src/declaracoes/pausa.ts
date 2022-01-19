import { Stmt } from "./stmt";


export class Pausa extends Stmt {
    constructor() {
        super();
    }

    aceitar(visitar: any): any {
        return visitar.visitarExpressaoPausa(this);
    }
}
