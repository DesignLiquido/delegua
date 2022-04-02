import { Construto } from "./construto";


export class Literal implements Construto {
    valor: any;

    constructor(valor: any) {
        this.valor = valor;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoLiteral(this);
    }
}
