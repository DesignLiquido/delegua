import { FuncaoDeclaracao } from '../declaracoes';
import { InformacaoElementoSintatico } from '../informacao-elemento-sintatico';
import { ElementoMontaoTipos } from './elemento-montao-tipos';

export class InformacaoEscopo {
    elementosSintaticos: { [nome: string]: InformacaoElementoSintatico | ElementoMontaoTipos };
    referenciasFuncoes: { [nome: string]: FuncaoDeclaracao };

    constructor() {
        this.elementosSintaticos = {};
        this.referenciasFuncoes = {};
    }
}
