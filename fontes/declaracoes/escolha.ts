import { Construto } from "../construtos";
import { Declaracao } from "./declaracao";


export class Escolha extends Declaracao {
    condicao: Construto;
    caminhos: any;
    caminhoPadrao: any;

    constructor(condicao: any, caminhos: any, caminhoPadrao: any) {
        super(condicao.linha, 0);
        this.condicao = condicao;
        this.caminhos = caminhos;
        this.caminhoPadrao = caminhoPadrao;
    }

    aceitar(visitante: any): any {
        return visitante.visitarExpressaoEscolha(this);
    }
}
