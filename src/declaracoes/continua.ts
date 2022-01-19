import { Stmt } from "./stmt";


export class Continua extends Stmt {
    constructor() {
        super();
    }

    aceitar(visitar: any): any {
        return visitar.visitarExpressaoContinua(this);
    }
}
