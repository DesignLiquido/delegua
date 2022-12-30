import { Construto } from '../construtos';
import { InterpretadorInterface } from '../interfaces';
import { Declaracao } from './declaracao';

export class Se extends Declaracao {
    condicao: Construto;
    caminhoEntao: Declaracao;
    caminhosSeSenao: any[];
    caminhoSenao: Declaracao;

    constructor(
        condicao: Construto,
        caminhoEntao: Declaracao,
        caminhosSeSenao: any[],
        caminhoSenao: Declaracao
    ) {
        super(condicao.linha, condicao.hashArquivo);
        this.condicao = condicao;
        this.caminhoEntao = caminhoEntao;
        this.caminhosSeSenao = caminhosSeSenao;
        this.caminhoSenao = caminhoSenao;
    }

    async aceitar(visitante: InterpretadorInterface): Promise<any> {
        return await visitante.visitarExpressaoSe(this);
    }
}
