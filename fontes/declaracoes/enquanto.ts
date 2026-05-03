import { ConstrutoInterface, VisitanteComumInterface } from '../interfaces';
import { EnquantoInterface } from '../interfaces/delegua';
import { Bloco } from './bloco';
import { Declaracao } from './declaracao';

export class Enquanto extends Declaracao implements EnquantoInterface {
    condicao: ConstrutoInterface;
    corpo: Bloco;

    constructor(condicao: ConstrutoInterface, corpo: Bloco) {
        super(condicao.linha, condicao.hashArquivo);
        this.condicao = condicao;
        this.corpo = corpo;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarDeclaracaoEnquanto(this);
    }

    paraTexto(): string {
        // TODO: Bloco.
        return `<enquanto condição=${this.condicao.paraTexto()} />`;
    }
}
