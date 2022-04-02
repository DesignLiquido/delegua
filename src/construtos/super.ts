import { Construto } from "./construto";


export class Super implements Construto {
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
