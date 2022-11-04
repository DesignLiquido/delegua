import { Declaracao } from '../declaracoes';
import { PontoParada } from '../depuracao';
import { InterpretadorInterface } from './interpretador-interface';

export interface InterpretadorComDepuracaoInterface
    extends InterpretadorInterface {
    comandoAdentrarEscopo: boolean;
    comandoProximo: boolean;
    pontoDeParadaAtivo: boolean;
    pontosParada: PontoParada[];

    interpretacaoApenasUmaInstrucao(): void;
    continuarInterpretacao(): void;
    interpretacaoApenasUmaInstrucao(): void;
    proximoESair(): void;
    prepararParaDepuracao(declaracoes: Declaracao[]): void;
}
