import { FuncaoConstruto } from '../construtos';
import { VisitanteComumInterface } from '../interfaces';
import { Declaracao } from './declaracao';

/**
 * Declaração `tente`.
 */
export class Tente extends Declaracao {
    caminhoTente: Declaracao[];
    caminhoPegue: FuncaoConstruto | Declaracao[];
    caminhoSenao: Declaracao[];
    caminhoFinalmente: Declaracao[];

    constructor(
        hashArquivo: number,
        linha: number,
        caminhoTente: Declaracao[],
        caminhoPegue: FuncaoConstruto | Declaracao[],
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
        const pegue = Array.isArray(this.caminhoPegue)
            ? this.caminhoPegue.map((d) => d.paraTexto()).join('')
            : this.caminhoPegue.paraTexto();
        const senao = this.caminhoSenao.map((d) => d.paraTexto()).join('');
        const finalmente = this.caminhoFinalmente.map((d) => d.paraTexto()).join('');
        return `<tente><tente-corpo>${tente}</tente-corpo><pegue>${pegue}</pegue><senão>${senao}</senão><finalmente>${finalmente}</finalmente></tente>`;
    }
}
