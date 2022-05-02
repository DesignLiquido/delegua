import { Declaracao } from "../declaracoes";
import { PontoParada, PragmaExecucao } from "../depuracao";
import { RetornoInterpretador } from "../interpretador";

export interface InterpretadorComDepuracaoInterface {
    pontosParada: PontoParada[];
    pilhaExecucao: PragmaExecucao[];
    
    interpretarParcial(declaracoes: Declaracao[]): RetornoInterpretador;
}
