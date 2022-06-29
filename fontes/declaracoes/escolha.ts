import { Construto } from "../construtos";
import { Declaracao } from "./declaracao";


export class Escolha extends Declaracao {
    condicao: Construto;
    caminhos: any;
    caminhoPadrao: any;

    constructor(condicao: Construto, caminhos: any, caminhoPadrao: any) {
        super(condicao.linha, condicao.hashArquivo);
        this.condicao = condicao;
        this.caminhos = caminhos;
        this.caminhoPadrao = caminhoPadrao;
    }

    aceitar(visitante: any): any {
        return visitante.visitarExpressaoEscolha(this);
    }
}
