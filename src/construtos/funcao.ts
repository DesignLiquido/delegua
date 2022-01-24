import { Expr } from "./expr";


export class Funcao implements Expr {
    parametros: any;
    corpo: any;

    constructor(parametros: any, corpo: any) {
        this.parametros = parametros;
        this.corpo = corpo;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoDeleguaFuncao(this);
    }
}
