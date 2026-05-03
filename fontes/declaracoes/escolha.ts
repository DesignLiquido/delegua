import { VisitanteComumInterface } from '../interfaces';
import { ConstrutoInterface } from '../interfaces/construtos/construto-interface';
import { CaminhoEscolha } from '../interfaces/construtos';
import { Declaracao } from './declaracao';

/**
 * Declaração de escolha de caminho a executar de acordo com literal ou identificador.
 */
export class Escolha extends Declaracao {
    identificadorOuLiteral: ConstrutoInterface;
    caminhos: CaminhoEscolha[];
    caminhoPadrao: CaminhoEscolha;

    constructor(
        identificadorOuLiteral: ConstrutoInterface,
        caminhos: CaminhoEscolha[],
        caminhoPadrao: CaminhoEscolha
    ) {
        super(identificadorOuLiteral.linha, identificadorOuLiteral.hashArquivo);
        this.identificadorOuLiteral = identificadorOuLiteral;
        this.caminhos = caminhos;
        this.caminhoPadrao = caminhoPadrao;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarDeclaracaoEscolha(this);
    }

    paraTexto(): string {
        // TODO: Caminhos
        return `<escolha identificadorOuLiteral=${this.identificadorOuLiteral} />`;
    }
}


