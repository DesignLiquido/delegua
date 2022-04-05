import { Declaracao } from "./declaracao";


export class Tente extends Declaracao {
    tryBranch: any;
    catchBranch: any;
    elseBranch: any;
    finallyBranch: any;

    constructor(tryBranch: any, catchBranch: any, elseBranch: any, finallyBranch: any) {
        super(0);
        this.tryBranch = tryBranch;
        this.catchBranch = catchBranch;
        this.elseBranch = elseBranch;
        this.finallyBranch = finallyBranch;
    }

    aceitar(visitante: any): any {
        return visitante.visitarExpressaoTente(this);
    }
}
