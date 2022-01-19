import { Stmt } from "./stmt";


export class Tente extends Stmt {
    tryBranch: any;
    catchBranch: any;
    elseBranch: any;
    finallyBranch: any;

    constructor(tryBranch: any, catchBranch: any, elseBranch: any, finallyBranch: any) {
        super();
        this.tryBranch = tryBranch;
        this.catchBranch = catchBranch;
        this.elseBranch = elseBranch;
        this.finallyBranch = finallyBranch;
    }

    aceitar(visitar: any): any {
        return visitar.visitarExpressaoTente(this);
    }
}
