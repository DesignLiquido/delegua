import { Construto } from '../../construtos';
import { Bloco, Declaracao } from '../../declaracoes';

export interface ParaInterface {
    hashArquivo: number;
    linha: number;
    inicializador?: Declaracao | Declaracao[];
    condicao: Construto;
    incrementar: Construto;
    corpo: Bloco;
    inicializada: boolean;
    blocoPosExecucao?: Bloco;
    resolverIncrementoEmExecucao: boolean;
}
