import { Stmt } from "./stmt";


export class Continua extends Stmt {
    constructor() {
        super();
    }

    aceitar(visitante: any): any {
        return visitante.visitarExpressaoContinua(this);
    }
}
