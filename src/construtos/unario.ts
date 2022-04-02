import { Construto } from "./construto";


export class Unario implements Construto {
    operador: any;
    direita: any;

    constructor(operador: any, direita: any) {
        this.operador = operador;
        this.direita = direita;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoUnaria(this);
    }
}
