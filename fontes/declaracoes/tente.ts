import { VisitanteComumInterface } from '../interfaces';
import { BlocoPegue } from './bloco-pegue';
import { Declaracao } from './declaracao';

/**
 * Declaração `tente`.
 */
export class Tente extends Declaracao {
    caminhoTente: Declaracao[];
    caminhoPegue: BlocoPegue[];
    caminhoSenao: Declaracao[];
    caminhoFinalmente: Declaracao[];

    constructor(
        hashArquivo: number,
        linha: number,
        caminhoTente: Declaracao[],
        caminhoPegue: BlocoPegue[],
        caminhoSenao: Declaracao[],
        caminhoFinalmente: Declaracao[]
    ) {
        super(linha, hashArquivo);
        this.caminhoTente = caminhoTente;
        this.caminhoPegue = caminhoPegue;
        this.caminhoSenao = caminhoSenao;
        this.caminhoFinalmente = caminhoFinalmente;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarDeclaracaoTente(this);
    }

    paraTexto(): string {
        const tente = this.caminhoTente.map((d) => d.paraTexto()).join('');
        const pegue = this.caminhoPegue
            .map((b) => b.corpo.map((d) => d.paraTexto()).join(''))
            .join('');
        const senao = this.caminhoSenao.map((d) => d.paraTexto()).join('');
        const finalmente = this.caminhoFinalmente.map((d) => d.paraTexto()).join('');
        return `<tente><tente-corpo>${tente}</tente-corpo><pegue>${pegue}</pegue><senão>${senao}</senão><finalmente>${finalmente}</finalmente></tente>`;
    }
}
