import { InterpretadorInterface, ResolvedorInterface } from "../interfaces";
import { Declaracao } from "./declaracao";


export class Retorna extends Declaracao {
    palavraChave: string;
    valor: any;

    constructor(palavraChave: any, valor: any) {
        super(0);
        this.palavraChave = palavraChave;
        this.valor = valor;
    }

    aceitar(visitante: ResolvedorInterface | InterpretadorInterface): any {
        return visitante.visitarExpressaoRetornar(this);
    }
}
