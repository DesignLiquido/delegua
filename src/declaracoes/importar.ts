import { Declaracao } from "./declaracao";


export class Importar extends Declaracao {
    caminho: string;
    simboloFechamento: any;

    constructor(caminho: any, simboloFechamento: any) {
        super(0);
        this.caminho = caminho;
        this.simboloFechamento = simboloFechamento;
    }

    aceitar(visitante: any): any {
        return visitante.visitarExpressaoImportar(this);
    }
}
