import { Construto } from "./construto";


export class Funcao implements Construto {
    linha: number;
    parametros: any;
    corpo: any;

    constructor(linha: number, parametros: any, corpo: any) {
        this.linha = linha;
        this.parametros = parametros;
        this.corpo = corpo;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoDeleguaFuncao(this);
    }
}
