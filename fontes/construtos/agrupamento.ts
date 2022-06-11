import { Construto } from "./construto";


export class Agrupamento implements Construto {
    linha: number;
    hashArquivo?: number;

    expressao: any;

    constructor(hashArquivo: number, linha: number, expressao: any) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;
        
        this.expressao = expressao;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoAgrupamento(this);
    }
}
