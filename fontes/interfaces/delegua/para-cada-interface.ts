import { Dupla, Variavel } from '../../construtos';
import { Bloco } from '../../declaracoes';
import { ConstrutoInterface } from '../construtos';

export interface ParaCadaInterface {
    hashArquivo: number;
    linha: number;
    variavelIteracao: Variavel | Dupla;
    vetorOuDicionario: ConstrutoInterface;
    corpo: Bloco;
    posicaoAtual: number;
}
