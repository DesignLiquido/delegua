import { Declaracao } from "./declaracao";


export class Tente extends Declaracao {
    caminhoTente: any;
    caminhoPegue: any;
    caminhoSenao: any;
    caminhoFinalmente: any;

    constructor(caminhoTente: any, caminhoPegue: any, caminhoSenao: any, caminhoFinalmente: any) {
        super(0);
        this.caminhoTente = caminhoTente;
        this.caminhoPegue = caminhoPegue;
        this.caminhoSenao = caminhoSenao;
        this.caminhoFinalmente = caminhoFinalmente;
    }

    aceitar(visitante: any): any {
        return visitante.visitarExpressaoTente(this);
    }
}
