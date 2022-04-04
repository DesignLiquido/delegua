import { Declaracao } from "./declaracao";


export class Se extends Declaracao {
    condicao: any;
    thenBranch: any;
    elifBranches: any;
    elseBranch: any;

    constructor(condicao: any, thenBranch: any, elifBranches: any, elseBranch: any) {
        super(0);
        this.condicao = condicao;
        this.thenBranch = thenBranch;
        this.elifBranches = elifBranches;
        this.elseBranch = elseBranch;
    }

    aceitar(visitante: any): any {
        return visitante.visitarExpressaoSe(this);
    }
}
