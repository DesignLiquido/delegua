import { Construto } from "../construtos";
import { Declaracao } from "./declaracao";

/**
 * Declaração de escolha de caminho a executar de acordo com literal ou identificador.
 */
export class Escolha extends Declaracao {
    identificadorOuLiteral: Construto;
    caminhos: any;
    caminhoPadrao: any;

    constructor(identificadorOuLiteral: Construto, caminhos: any, caminhoPadrao: any) {
        super(identificadorOuLiteral.linha, identificadorOuLiteral.hashArquivo);
        this.identificadorOuLiteral = identificadorOuLiteral;
        this.caminhos = caminhos;
        this.caminhoPadrao = caminhoPadrao;
    }

    aceitar(visitante: any): any {
        return visitante.visitarExpressaoEscolha(this);
    }
}
