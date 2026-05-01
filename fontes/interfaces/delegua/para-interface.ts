import { Bloco, Declaracao } from '../../declaracoes';
import { ConstrutoInterface } from '../construtos';

export interface ParaInterface {
    hashArquivo: number;
    linha: number;
    inicializador?: Declaracao | Declaracao[];
    condicao: ConstrutoInterface;
    incrementar: ConstrutoInterface;
    corpo: Bloco;
    inicializada: boolean;
    blocoPosExecucao?: Bloco;
    resolverIncrementoEmExecucao: boolean;
}
