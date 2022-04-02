import { Declaracao } from "./declaracao";


export class Escolha extends Declaracao {
    condicao: any;
    branches: any;
    defaultBranch: any;

    constructor(condicao: any, branches: any, defaultBranch: any) {
        super();
        this.condicao = condicao;
        this.branches = branches;
        this.defaultBranch = defaultBranch;
    }

    aceitar(visitante: any): any {
        return visitante.visitarExpressaoEscolha(this);
    }
}
