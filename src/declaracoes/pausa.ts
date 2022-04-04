import { Declaracao } from "./declaracao";


export class Pausa extends Declaracao {
    constructor() {
        super(0);
    }

    aceitar(visitante: any): any {
        return visitante.visitarExpressaoPausa(this);
    }
}
