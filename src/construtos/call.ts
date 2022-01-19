import { Expr } from "./expr";


export class Call extends Expr {
    callee: any;
    argumentos: any;
    parentese: any;

    constructor(callee: any, parentese: any, argumentos: any) {
        super();
        this.callee = callee;
        this.parentese = parentese;
        this.argumentos = argumentos;
    }

    aceitar(visitar: any) {
        return visitar.visitarExpressaoDeChamada(this);
    }
}
