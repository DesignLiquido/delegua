import { Construto } from '../construtos';
import { InterpretadorInterface } from '../interfaces';
import { CaminhoEscolha } from '../interfaces/construtos';
import { Declaracao } from './declaracao';

/**
 * Declaração de escolha de caminho a executar de acordo com literal ou identificador.
 */
export class Escolha extends Declaracao {
    identificadorOuLiteral: Construto;
    caminhos: CaminhoEscolha[];
    caminhoPadrao: CaminhoEscolha;

    constructor(
        identificadorOuLiteral: Construto,
        caminhos: CaminhoEscolha[],
        caminhoPadrao: CaminhoEscolha
    ) {
        super(identificadorOuLiteral.linha, identificadorOuLiteral.hashArquivo);
        this.identificadorOuLiteral = identificadorOuLiteral;
        this.caminhos = caminhos;
        this.caminhoPadrao = caminhoPadrao;
    }

    async aceitar(visitante: InterpretadorInterface): Promise<any> {
        return await visitante.visitarExpressaoEscolha(this);
    }
}
