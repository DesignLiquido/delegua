import { EspacoVariaveis } from '../espaco-variaveis';
import { Declaracao } from '../declaracoes';

export type TipoEscopoExecucao = 'funcao' | 'repeticao' | 'outro';

export interface EscopoExecucao {
    declaracoes: Declaracao[];
    preCondicao?: Declaracao;
    preCondicaoExecutada?: boolean;
    posCondicao?: Declaracao;
    posCondicaoExecutada?: boolean;
    declaracaoAtual: number;
    ambiente: EspacoVariaveis;
    finalizado: boolean;
    tipo: TipoEscopoExecucao;
    idChamada?: string;
    emLacoRepeticao: boolean;
}
