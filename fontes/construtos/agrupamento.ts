import { Construto } from "./construto";


export class Agrupamento implements Construto {
    linha: number;
    expressao: any;

    constructor(linha: number, expressao: any) {
        this.linha = linha;
        this.expressao = expressao;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoAgrupamento(this);
    }
}
