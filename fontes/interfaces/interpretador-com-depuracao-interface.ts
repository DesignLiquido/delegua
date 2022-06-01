import { Declaracao } from "../declaracoes";
import { PontoParada, PragmaExecucao } from "../depuracao";
import { RetornoInterpretador } from "../interpretador";

export interface InterpretadorComDepuracaoInterface {
    pontosParada: PontoParada[];
    pilhaExecucao: PragmaExecucao[];
    declaracaoAtual: number;
    finalizacaoDaExecucao: Function;

    interpretarParcial(declaracoes: Declaracao[]): RetornoInterpretador;
    continuarInterpretacaoParcial(naoVerificarPrimeiraExecucao: boolean): RetornoInterpretador;
}
