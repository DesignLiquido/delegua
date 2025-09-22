import { Construto } from '../construtos';
import { VisitanteComumInterface } from '../interfaces';
import { EnquantoInterface } from '../interfaces/delegua';
import { Bloco } from './bloco';
import { Declaracao } from './declaracao';

export class Enquanto extends Declaracao implements EnquantoInterface {
    condicao: Construto;
    corpo: Bloco;

    constructor(condicao: Construto, corpo: Bloco) {
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
