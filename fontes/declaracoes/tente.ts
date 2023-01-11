import { FuncaoConstruto } from '../construtos';
import { InterpretadorInterface } from '../interfaces';
import { Declaracao } from './declaracao';

/**
 * Declaração `tente`.
 */
export class Tente extends Declaracao {
    caminhoTente: any[];
    caminhoPegue: any[];
    caminhoSenao: any[];
    caminhoFinalmente: any[];

    constructor(
        hashArquivo: number,
        linha: number,
        caminhoTente: any[],
        caminhoPegue: any[],
        caminhoSenao: any[],
        caminhoFinalmente: any[]
    ) {
        super(linha, hashArquivo);
        this.caminhoTente = caminhoTente;
        this.caminhoPegue = caminhoPegue;
        this.caminhoSenao = caminhoSenao;
        this.caminhoFinalmente = caminhoFinalmente;
    }

    async aceitar(visitante: InterpretadorInterface): Promise<any> {
        return await visitante.visitarExpressaoTente(this);
    }
}
