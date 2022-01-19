import { Stmt } from "./stmt";


export class Expressao extends Stmt {
    expressao: any;

    constructor(expressao: any) {
        super();
        this.expressao = expressao;
    }

    aceitar(visitar: any): any {
        return visitar.visitarDeclaracaoDeExpressao(this);
    }
}
