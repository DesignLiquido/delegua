import { FuncaoDeclaracao } from '../declaracoes';
import { InformacaoVariavelOuConstante } from '../informacao-variavel-ou-constante';

export class InformacaoEscopo {
    variaveisEConstantes: { [nome: string]: InformacaoVariavelOuConstante };
    referenciasFuncoes: { [nome: string]: FuncaoDeclaracao };

    constructor() {
        this.variaveisEConstantes = {};
        this.referenciasFuncoes = {};
    }
}
