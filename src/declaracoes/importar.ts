import { Declaracao } from "./declaracao";


export class Importar extends Declaracao {
    caminho: string;
    closeBracket: any;

    constructor(caminho: any, closeBracket: any) {
        super(0);
        this.caminho = caminho;
        this.closeBracket = closeBracket;
    }

    aceitar(visitante: any): any {
        return visitante.visitarExpressaoImportar(this);
    }
}
