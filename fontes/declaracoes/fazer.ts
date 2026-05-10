import { ConstrutoInterface, VisitanteComumInterface } from '../interfaces';
import { FazerInterface } from '../interfaces/delegua';
import { Bloco } from './bloco';
import { Declaracao } from './declaracao';

export class Fazer extends Declaracao implements FazerInterface {
    caminhoFazer: Bloco;
    condicaoEnquanto: ConstrutoInterface;

    constructor(
        hashArquivo: number,
        linha: number,
        caminhoFazer: Bloco,
        condicaoEnquanto: ConstrutoInterface
    ) {
        super(linha, hashArquivo);
        this.caminhoFazer = caminhoFazer;
        this.condicaoEnquanto = condicaoEnquanto;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarDeclaracaoFazer(this);
    }

    paraTexto(): string {
        return `<fazer>${this.caminhoFazer.paraTexto()}<condição>${this.condicaoEnquanto.paraTexto()}</condição></fazer>`;
    }
}
