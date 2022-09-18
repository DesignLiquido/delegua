import { Construto } from "./construto";


export class Funcao implements Construto {
    linha: number;
    hashArquivo?: number;

    parametros: any[];
    corpo: any;

    constructor(hashArquivo: number, linha: number, parametros: any[], corpo: any) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;
        
        this.parametros = parametros;
        this.corpo = corpo;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoDeleguaFuncao(this);
    }
}
