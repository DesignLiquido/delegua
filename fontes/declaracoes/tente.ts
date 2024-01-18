import { FuncaoConstruto } from '../construtos';
import { VisitanteComumInterface } from '../interfaces';
import { Declaracao } from './declaracao';

/**
 * Declaração `tente`.
 */
export class Tente extends Declaracao {
    caminhoTente: Declaracao[];
    caminhoPegue: FuncaoConstruto | Declaracao[];
    caminhoSenao: any[];
    caminhoFinalmente: Declaracao[];

    constructor(
        hashArquivo: number,
        linha: number,
        caminhoTente: any[],
        caminhoPegue: FuncaoConstruto | Declaracao[],
        caminhoSenao: any[],
        caminhoFinalmente: any[]
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
}
