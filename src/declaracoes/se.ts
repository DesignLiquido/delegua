import { Stmt } from "./stmt";


export class Se extends Stmt {
    condicao: any;
    thenBranch: any;
    elifBranches: any;
    elseBranch: any;

    constructor(condicao: any, thenBranch: any, elifBranches: any, elseBranch: any) {
        super();
        this.condicao = condicao;
        this.thenBranch = thenBranch;
        this.elifBranches = elifBranches;
        this.elseBranch = elseBranch;
    }

    aceitar(visitar: any): any {
        return visitar.visitarExpressaoSe(this);
    }
}
