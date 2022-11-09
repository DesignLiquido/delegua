import { Construto } from '../construtos';
import { InterpretadorInterface } from '../interfaces';
import { Bloco } from './bloco';
import { Declaracao } from './declaracao';

export class Se extends Declaracao {
    condicao: Construto;
    caminhoEntao: Bloco;
    caminhosSeSenao: any[];
    caminhoSenao: any;

    constructor(
        condicao: Construto,
        caminhoEntao: Bloco,
        caminhosSeSenao: any[],
        caminhoSenao: any
    ) {
        super(condicao.linha, condicao.hashArquivo);
        this.condicao = condicao;
        this.caminhoEntao = caminhoEntao;
        this.caminhosSeSenao = caminhosSeSenao;
        this.caminhoSenao = caminhoSenao;
    }

    aceitar(visitante: InterpretadorInterface): any {
        return visitante.visitarExpressaoSe(this);
    }
}
