import { Literal } from "../construtos";
import { Declaracao } from "./declaracao";


export class Importar extends Declaracao {
    caminho: Literal;
    simboloFechamento: any;

    constructor(caminho: Literal, simboloFechamento: any) {
        super(0);
        this.caminho = caminho;
        this.simboloFechamento = simboloFechamento;
    }

    aceitar(visitante: any): any {
        return visitante.visitarExpressaoImportar(this);
    }
}
