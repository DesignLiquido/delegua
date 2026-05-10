import { ConstrutoInterface, SimboloInterface, VisitanteComumInterface } from '../interfaces';
import { Declaracao } from './declaracao';
import { Bloco } from './bloco';

/**
 * Esta declaração funciona para designar uma variável que deve ser encerrada
 * após a execução do bloco.
 * Por exemplo, abertura de arquivos, variáveis de fluxo (`streams`), etc.
 */
export class TendoComo extends Declaracao {
    simboloVariavel: SimboloInterface;
    inicializacaoVariavel: ConstrutoInterface;
    corpo: Bloco;

    constructor(
        linha: number,
        hashArquivo: number,
        simboloVariavel: SimboloInterface,
        inicializacaoVariavel: ConstrutoInterface,
        corpo: Bloco
    ) {
        super(linha, hashArquivo);
        this.simboloVariavel = simboloVariavel;
        this.inicializacaoVariavel = inicializacaoVariavel;
        this.corpo = corpo;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarDeclaracaoTendoComo(this);
    }

    paraTexto(): string {
        return `<tendo variável=${this.simboloVariavel.lexema} como=${this.inicializacaoVariavel.paraTexto()}>${this.corpo.paraTexto()}</tendo>`;
    }
}
