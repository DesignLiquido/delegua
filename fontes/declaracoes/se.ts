import { Construto } from '../construtos';
import { VisitanteComumInterface } from '../interfaces';
import { CaminhoSeSenao } from '../interfaces/declaracoes';
import { Declaracao } from './declaracao';

export class Se extends Declaracao {
    condicao: Construto;
    caminhoEntao: Declaracao;
    caminhosSeSenao?: CaminhoSeSenao[] | undefined;
    caminhoSenao?: Declaracao | undefined;

    constructor(
        condicao: Construto,
        caminhoEntao: Declaracao,
        caminhosSeSenao?: CaminhoSeSenao[] | undefined,
        caminhoSenao?: Declaracao | undefined
    ) {
        super(condicao.linha, condicao.hashArquivo);
        this.condicao = condicao;
        this.caminhoEntao = caminhoEntao;
        this.caminhosSeSenao = caminhosSeSenao;
        this.caminhoSenao = caminhoSenao;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarDeclaracaoSe(this);
    }

    paraTexto(): string {
        // TODO: Bloco então, bloco senão, outros.
        return `<se condiçao=${this.condicao.paraTexto()} />`;
    }
}
