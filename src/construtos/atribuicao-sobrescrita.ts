import { Expr } from "./expr";


export class AtribuicaoSobrescrita extends Expr {
    objeto: any;
    valor: any;
    indice: any;

    constructor(objeto: any, indice: any, valor: any) {
        super();
        this.objeto = objeto;
        this.indice = indice;
        this.valor = valor;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoAtribuicaoSobrescrita(this);
    }
}
