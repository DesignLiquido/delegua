import { Expr } from "./expr";


export class Super implements Expr {
    palavraChave: any;
    metodo: any;

    constructor(palavraChave: any, metodo: any) {
        this.palavraChave = palavraChave;
        this.metodo = metodo;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoSuper(this);
    }
}
