import { Declaracao } from "./declaracao";


export class Sustar extends Declaracao {
    constructor() {
        super(0);
    }

    aceitar(visitante: any): any {
        return visitante.visitarExpressaoSustar(this);
    }
}
