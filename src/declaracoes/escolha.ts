import { Stmt } from "./stmt";


export class Escolha extends Stmt {
    condicao: any;
    branches: any;
    defaultBranch: any;

    constructor(condicao: any, branches: any, defaultBranch: any) {
        super();
        this.condicao = condicao;
        this.branches = branches;
        this.defaultBranch = defaultBranch;
    }

    aceitar(visitar: any): any {
        return visitar.visitarExpressaoEscolha(this);
    }
}
