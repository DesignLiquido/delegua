import { Expr } from "./expr";


export class Call implements Expr {
    callee: any;
    argumentos: any;
    parentese: any;

    constructor(callee: any, parentese: any, argumentos: any) {
        this.callee = callee;
        this.parentese = parentese;
        this.argumentos = argumentos;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoDeChamada(this);
    }
}
