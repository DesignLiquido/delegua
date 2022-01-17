import { Stmt } from "./stmt";


export class Fazer extends Stmt {
    doBranch: any;
    whileCondition: any;

    constructor(doBranch: any, whileCondition: any) {
        super();
        this.doBranch = doBranch;
        this.whileCondition = whileCondition;
    }

    aceitar(visitor: any): any {
        return visitor.visitarExpressaoFazer(this);
    }
}
