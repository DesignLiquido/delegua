import { Construto } from '../construtos';
import { VisitanteComumInterface } from '../interfaces';
import { FazerInterface } from '../interfaces/delegua';
import { Bloco } from './bloco';
import { Declaracao } from './declaracao';

export class Fazer extends Declaracao implements FazerInterface {
    caminhoFazer: Bloco;
    condicaoEnquanto: Construto;

    constructor(
        hashArquivo: number,
        linha: number,
        caminhoFazer: Bloco,
        condicaoEnquanto: Construto
    ) {
        super(linha, hashArquivo);
        this.caminhoFazer = caminhoFazer;
        this.condicaoEnquanto = condicaoEnquanto;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarDeclaracaoFazer(this);
    }

    paraTexto(): string {
        // TODO: Bloco.
        return `<fazer condição=${this.condicaoEnquanto.paraTexto()} />`;
    }
}
