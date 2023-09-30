import { VisitanteComumInterface } from '../interfaces';
import { Bloco } from './bloco';
import { Declaracao } from './declaracao';

export class ParaCada extends Declaracao {
    nomeVariavelIteracao: string;
    vetor: any;
    corpo: Bloco;
    posicaoAtual: number;

    constructor(hashArquivo: number, linha: number, nomeVariavelIteracao: string, vetor: any, corpo: Bloco) {
        super(linha, hashArquivo);
        this.nomeVariavelIteracao = nomeVariavelIteracao;
        this.vetor = vetor;
        this.corpo = corpo;
        this.posicaoAtual = 0;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarDeclaracaoParaCada(this);
    }
}
