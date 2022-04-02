import { Construto } from "./construto";


export class Grouping implements Construto {
    expressao: any;

    constructor(expressao: any) {
        this.expressao = expressao;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoAgrupamento(this);
    }
}
