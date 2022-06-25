import { Construto } from "../construtos";
import { Declaracao } from "./declaracao";


export class Enquanto extends Declaracao {
    condicao: Construto;
    corpo: any;

    constructor(condicao: Construto, corpo: any) {
        super(condicao.linha, condicao.hashArquivo);
        this.condicao = condicao;
        this.corpo = corpo;
    }

    aceitar(visitante: any): any {
        return visitante.visitarExpressaoEnquanto(this);
    }
}
