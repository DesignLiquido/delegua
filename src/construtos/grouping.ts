import { Expr } from "./expr";


export class Grouping implements Expr {
    expressao: any;

    constructor(expressao: any) {
        this.expressao = expressao;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoAgrupamento(this);
    }
}
