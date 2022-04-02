import { Declaracao } from "./declaracao";


export class Funcao extends Declaracao {
    nome: string;
    funcao: any;

    constructor(nome: any, funcao: any) {
        super();
        this.nome = nome;
        this.funcao = funcao;
    }

    aceitar(visitante: any): any {
        return visitante.visitarExpressaoFuncao(this);
    }
}
