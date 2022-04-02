import { Construto } from "./construto";


export class Funcao implements Construto {
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
