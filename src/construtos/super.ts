import { Construto } from "./construto";


export class Super implements Construto {
    linha: number;
    palavraChave: any;
    metodo: any;

    constructor(linha: number, palavraChave: any, metodo: any) {
        this.linha = linha;
        this.palavraChave = palavraChave;
        this.metodo = metodo;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoSuper(this);
    }
}
