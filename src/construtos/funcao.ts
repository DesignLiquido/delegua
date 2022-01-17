import { Expr } from "./expr";


export class Funcao extends Expr {
    parametros: any;
    corpo: any;

    constructor(parametros: any, corpo: any) {
        super();
        this.parametros = parametros;
        this.corpo = corpo;
    }

    aceitar(visitor: any) {
        return visitor.visitarExpressaoDeleguaFuncao(this);
    }
}
