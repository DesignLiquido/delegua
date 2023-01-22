import { Construto } from '../construtos';
import { InterpretadorInterface } from '../interfaces';
import { Declaracao } from './declaracao';

export class Se extends Declaracao {
    condicao: Construto;
    caminhoEntao: Declaracao;
    caminhosSeSenao?: any[] | null;
    caminhoSenao?: Declaracao | null;

    constructor(
        condicao: Construto,
        caminhoEntao: Declaracao,
        caminhosSeSenao?: any[] | null,
        caminhoSenao?: Declaracao | null
    ) {
        super(condicao.linha, condicao.hashArquivo);
        this.condicao = condicao;
        this.caminhoEntao = caminhoEntao;
        this.caminhosSeSenao = caminhosSeSenao;
        this.caminhoSenao = caminhoSenao;
    }

    async aceitar(visitante: InterpretadorInterface): Promise<any> {
        return await visitante.visitarDeclaracaoSe(this);
    }
}
