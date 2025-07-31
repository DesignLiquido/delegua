import { Construto, Dupla, Variavel } from '../construtos';
import { VisitanteComumInterface } from '../interfaces';
import { Bloco } from './bloco';
import { Declaracao } from './declaracao';

export class ParaCada extends Declaracao {
    variavelIteracao: Variavel | Dupla;
    vetor: Construto;
    corpo: Bloco;
    posicaoAtual: number;

    constructor(
        hashArquivo: number,
        linha: number,
        variavelIteracao: Variavel | Dupla,
        vetor: Construto,
        corpo: Bloco
    ) {
        super(linha, hashArquivo);
        this.variavelIteracao = variavelIteracao;
        this.vetor = vetor;
        this.corpo = corpo;
        this.posicaoAtual = 0;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarDeclaracaoParaCada(this);
    }
}
