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
    /**
     * Indica se o cabeçalho do `para` (inicializador; condição; incremento) foi
     * escrito entre parênteses no código-fonte original. Os parênteses são
     * opcionais na gramática; este campo existe para que o formatador possa
     * reproduzir o estilo original em vez de impor um estilo fixo.
     */
    comParenteses?: boolean;
}
