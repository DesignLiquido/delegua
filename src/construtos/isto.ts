import { Construto } from "./construto";


export class Isto implements Construto {
    palavraChave: any;

    constructor(palavraChave?: any) {
        this.palavraChave = palavraChave;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoIsto(this);
    }
}
