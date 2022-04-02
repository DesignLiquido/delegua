import { Declaracao } from "./declaracao";


export class Continua extends Declaracao {
    constructor() {
        super();
    }

    aceitar(visitante: any): any {
        return visitante.visitarExpressaoContinua(this);
    }
}
