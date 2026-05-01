import { ConstrutoInterface, VisitanteComumInterface } from '../interfaces';
import { CaminhoSeSenaoInterface } from '../interfaces/declaracoes';
import { Declaracao } from './declaracao';

export class Se extends Declaracao {
    condicao: ConstrutoInterface;
    caminhoEntao: Declaracao;
    caminhosSeSenao?: CaminhoSeSenaoInterface[] | undefined;
    caminhoSenao?: Declaracao | undefined;

    constructor(
        condicao: ConstrutoInterface,
        caminhoEntao: Declaracao,
        caminhosSeSenao?: CaminhoSeSenaoInterface[] | undefined,
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
