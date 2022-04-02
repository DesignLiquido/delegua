import { Declaracao } from "./declaracao";


export class Pausa extends Declaracao {
    constructor() {
        super();
    }

    aceitar(visitante: any): any {
        return visitante.visitarExpressaoPausa(this);
    }
}
