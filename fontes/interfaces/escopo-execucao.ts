import { EspacoMemoria } from '../interpretador/espaco-memoria';
import { Declaracao } from '../declaracoes';

export type TipoEscopoExecucao = 'funcao' | 'repeticao' | 'outro';

export interface EscopoExecucaoInterface {
    declaracoes: Declaracao[];
    declaracaoAtual: number;
    espacoMemoria: EspacoMemoria;
    finalizado: boolean;
    tipo: TipoEscopoExecucao;
    idChamada?: string;
    emLacoRepeticao: boolean;
}
