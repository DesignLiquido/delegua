import { Stmt } from "./stmt";


export class Escreva extends Stmt {
    expressao: any;

    constructor(expressao: any) {
        super();
        this.expressao = expressao;
    }

    aceitar(visitante: any): any {
        return visitante.visitarExpressaoEscreva(this);
    }
}
