import { Construto, Dupla, Variavel } from '../../construtos';
import { Bloco } from '../../declaracoes';

export interface ParaCadaInterface {
    hashArquivo: number;
    linha: number;
    variavelIteracao: Variavel | Dupla;
    vetorOuDicionario: Construto;
    corpo: Bloco;
    posicaoAtual: number;
}
