import { InterpretadorInterface, ResolvedorInterface } from "../interfaces";
import { Declaracao } from "./declaracao";


export class Tente extends Declaracao {
    caminhoTente: any;
    caminhoPegue: any;
    caminhoSenao: any;
    caminhoFinalmente: any;

    constructor(hashArquivo: number, linha: number, caminhoTente: any, caminhoPegue: any, caminhoSenao: any, caminhoFinalmente: any) {
        super(linha, hashArquivo);
        this.caminhoTente = caminhoTente;
        this.caminhoPegue = caminhoPegue;
        this.caminhoSenao = caminhoSenao;
        this.caminhoFinalmente = caminhoFinalmente;
    }

    aceitar(visitante: ResolvedorInterface | InterpretadorInterface): any {
        return visitante.visitarExpressaoTente(this);
    }
}
