import { Declaracao } from '../declaracoes';
import { PontoParada } from '../depuracao';
import { TipoEscopoExecucao } from './escopo-execucao';
import { InterpretadorInterface } from './interpretador-interface';

export type ComandoDepurador =
    | 'proximo'
    | 'adentrarEscopo'
    | 'proximoESair'
    | 'continuar'
    | 'pausar';

export interface InterpretadorComDepuracaoInterface extends InterpretadorInterface {
    comando?: ComandoDepurador;
    pontoDeParadaAtivo: boolean;
    pontosParada: PontoParada[];
    avisoPontoParadaAtivado: Function;
    finalizacaoDaExecucao: Function;
    escopoAtual: number;
    executandoChamada: boolean;
    passos: number;
    idChamadaAtual?: string;
    proximoEscopo?: TipoEscopoExecucao;

    adentrarEscopo(): Promise<any>;
    instrucaoPasso(): Promise<any>;
    instrucaoContinuarInterpretacao(): Promise<any>;
    instrucaoProximoESair(): Promise<any>;
    prepararParaDepuracao(declaracoes: Declaracao[]): void;
    obterVariavel(nome: string): any;
}
