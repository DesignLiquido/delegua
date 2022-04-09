import { Construto } from "./construto";


export class Isto implements Construto {
    linha: number;
    palavraChave: any;

    constructor(linha: number, palavraChave?: any) {
        this.linha = linha;
        this.palavraChave = palavraChave;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoIsto(this);
    }
}
