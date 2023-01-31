import { Declaracao } from '../declaracoes';
import { PontoParada } from '../depuracao';
import { InterpretadorInterface } from './interpretador-interface';

export interface InterpretadorComDepuracaoInterface
    extends InterpretadorInterface {
    comandoAdentrarEscopo: boolean;
    comandoProximo: boolean;
    pontoDeParadaAtivo: boolean;
    pontosParada: PontoParada[];

    interpretarApenasUmaInstrucao(): Promise<any>;
    continuarInterpretacao(): Promise<any>;
    proximoESair(): Promise<any>;
    prepararParaDepuracao(declaracoes: Declaracao[]): void;
}
