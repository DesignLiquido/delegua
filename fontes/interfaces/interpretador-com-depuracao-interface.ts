import { Declaracao } from '../declaracoes';
import { PontoParada } from '../depuracao';
import { InterpretadorInterface } from './interpretador-interface';

export type ComandoDepurador = 'proximo' | 'adentrarEscopo' | 'proximoESair' | 'continuar';

export interface InterpretadorComDepuracaoInterface extends InterpretadorInterface {
    comando?: ComandoDepurador;
    pontoDeParadaAtivo: boolean;
    pontosParada: PontoParada[];
    avisoPontoParadaAtivado: Function;
    finalizacaoDaExecucao: Function;

    adentrarEscopo(): Promise<any>;
    instrucaoPasso(): Promise<any>;
    instrucaoContinuarInterpretacao(): Promise<any>;
    instrucaoProximoESair(): Promise<any>;
    prepararParaDepuracao(declaracoes: Declaracao[]): void;
    obterVariavel(nome: string): Promise<any>;
}
