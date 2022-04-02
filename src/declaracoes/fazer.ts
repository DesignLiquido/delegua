import { Declaracao } from "./declaracao";


export class Fazer extends Declaracao {
    doBranch: any;
    whileCondition: any;

    constructor(doBranch: any, whileCondition: any) {
        super();
        this.doBranch = doBranch;
        this.whileCondition = whileCondition;
    }

    aceitar(visitante: any): any {
        return visitante.visitarExpressaoFazer(this);
    }
}
