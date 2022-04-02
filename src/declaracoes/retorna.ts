import { Declaracao } from "./declaracao";


export class Retorna extends Declaracao {
    palavraChave: string;
    valor: any;

    constructor(palavraChave: any, valor: any) {
        super();
        this.palavraChave = palavraChave;
        this.valor = valor;
    }

    aceitar(visitante: any): any {
        return visitante.visitarExpressaoRetornar(this);
    }
}
