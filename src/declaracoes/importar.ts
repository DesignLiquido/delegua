import { Stmt } from "./stmt";


export class Importar extends Stmt {
    caminho: string;
    closeBracket: any;

    constructor(caminho: any, closeBracket: any) {
        super();
        this.caminho = caminho;
        this.closeBracket = closeBracket;
    }

    aceitar(visitar: any): any {
        return visitar.visitarExpressaoImportar(this);
    }
}
