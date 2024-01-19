import { Construto } from '../construtos';
import { VisitanteComumInterface } from '../interfaces';
import { Bloco } from './bloco';
import { Declaracao } from './declaracao';

export class Fazer extends Declaracao {
    caminhoFazer: Bloco;
    condicaoEnquanto: Construto;

    constructor(hashArquivo: number, linha: number, caminhoFazer: any, condicaoEnquanto: any) {
        super(linha, hashArquivo);
        this.caminhoFazer = caminhoFazer;
        this.condicaoEnquanto = condicaoEnquanto;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarDeclaracaoFazer(this);
    }
}
