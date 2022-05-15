import { Declaracao } from "../declaracoes";
import { PontoParada, PragmaExecucao } from "../depuracao";
import { RetornoInterpretador } from "../interpretador";

export interface InterpretadorComDepuracaoInterface {
    pontosParada: PontoParada[];
    pilhaExecucao: PragmaExecucao[];
    declaracaoAtual: number;
    finalizacaoDaExecucao: Function;

    etapaResolucao(declaracoes: Declaracao[]): void;
    interpretarParcial(declaracoes: Declaracao[]): RetornoInterpretador;
    continuarInterpretacaoParcial(): RetornoInterpretador;
}
