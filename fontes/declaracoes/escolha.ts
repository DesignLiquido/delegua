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
        const caminhos = this.caminhos
            .map((c) => {
                const condicoes = c.condicoes.map((cond) => cond.paraTexto()).join(',');
                const declaracoes = c.declaracoes.map((d) => d.paraTexto()).join('');
                return `<caminho condicoes=[${condicoes}]>${declaracoes}</caminho>`;
            })
            .join('');
        const padrao = this.caminhoPadrao?.declaracoes.map((d) => d.paraTexto()).join('') ?? '';
        return `<escolha identificadorOuLiteral=${this.identificadorOuLiteral.paraTexto()}>${caminhos}<padrão>${padrao}</padrão></escolha>`;
    }
}


