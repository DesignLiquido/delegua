import { Construto, Dupla, Variavel } from '../construtos';
import { VisitanteDeleguaInterface } from '../interfaces';
import { ParaCadaInterface } from '../interfaces/delegua';
import { Bloco } from './bloco';
import { Declaracao } from './declaracao';

export class ParaCada extends Declaracao implements ParaCadaInterface {
    variavelIteracao: Variavel | Dupla;
    vetorOuDicionario: Construto;
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
        this.vetorOuDicionario = vetor;
        this.corpo = corpo;
        this.posicaoAtual = 0;
    }

    async aceitar(visitante: VisitanteDeleguaInterface): Promise<any> {
        return await visitante.visitarDeclaracaoParaCada(this);
    }

    paraTexto(): string {
        // TODO: Corpo.
        return `<para-cada variávelIteração=${this.variavelIteracao.paraTexto()} />`;
    }
}
