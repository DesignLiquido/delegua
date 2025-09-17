import { FuncaoDeclaracao } from '../declaracoes';
import { InformacaoElementoSintatico } from '../informacao-elemento-sintatico';

export class InformacaoEscopo {
    elementosSintaticos: { [nome: string]: InformacaoElementoSintatico };
    referenciasFuncoes: { [nome: string]: FuncaoDeclaracao };

    constructor() {
        this.elementosSintaticos = {};
        this.referenciasFuncoes = {};
    }
}
