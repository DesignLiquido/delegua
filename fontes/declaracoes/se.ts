import { Declaracao } from "./declaracao";


export class Se extends Declaracao {
    condicao: any;
    caminhoEntao: any;
    caminhosSeSenao: any;
    caminhoSenao: any;

    constructor(linha: number, condicao: any, caminhoEntao: any, caminhosSeSenao: any, caminhoSenao: any) {
        super(linha, 0);
        this.condicao = condicao;
        this.caminhoEntao = caminhoEntao;
        this.caminhosSeSenao = caminhosSeSenao;
        this.caminhoSenao = caminhoSenao;
    }

    aceitar(visitante: any): any {
        return visitante.visitarExpressaoSe(this);
    }
}
