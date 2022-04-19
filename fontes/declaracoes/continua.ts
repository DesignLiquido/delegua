import { Declaracao } from "./declaracao";


export class Continua extends Declaracao {
    constructor() {
        super(0);
    }

    aceitar(visitante: any): any {
        return visitante.visitarExpressaoContinua(this);
    }
}
