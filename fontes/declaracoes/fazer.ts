import { InterpretadorInterface } from '../interfaces';
import { Declaracao } from './declaracao';

export class Fazer extends Declaracao {
    caminhoFazer: any;
    condicaoEnquanto: any;

    constructor(hashArquivo: number, linha: number, caminhoFazer: any, condicaoEnquanto: any) {
        super(linha, hashArquivo);
        this.caminhoFazer = caminhoFazer;
        this.condicaoEnquanto = condicaoEnquanto;
    }

    async aceitar(visitante: InterpretadorInterface): Promise<any> {
        return await visitante.visitarDeclaracaoFazer(this);
    }
}
