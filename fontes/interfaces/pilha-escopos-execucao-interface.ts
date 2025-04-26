import { DeleguaFuncao } from '../interpretador/estruturas';
import { EscopoExecucao } from './escopo-execucao';
import { PilhaInterface } from './pilha-interface';
import { SimboloInterface } from './simbolo-interface';
import { VariavelInterface } from './variavel-interface';

export interface PilhaEscoposExecucaoInterface extends PilhaInterface<EscopoExecucao> {
    atribuirVariavel(simbolo: SimboloInterface, valor: any, indice?: number): void;
    atribuirVariavelEm(distancia: number, simbolo: SimboloInterface, valor: any): void;
    definirConstante(nomeConstante: string, valor: any, tipo?: string): void;
    definirVariavel(nomeVariavel: string, valor: any, tipo?: string): void;
    elementos(): number;
    naPosicao(posicao: number): EscopoExecucao;
    obterEscopoPorTipo(idChamada: string): EscopoExecucao | undefined;
    obterTodasDeclaracoesClasse(): any;
    obterTodasVariaveis(todasVariaveis: any[]): { valor: any; nome: string; tipo: string }[];
    obterTodasDeleguaFuncao(): { [nome: string]: DeleguaFuncao };
    obterReferenciaFuncao(idFuncao: string): DeleguaFuncao;
    obterValorVariavel(simbolo: SimboloInterface): VariavelInterface;
    obterVariavelEm(distancia: number, nome: string): VariavelInterface;
    obterVariavelPorNome(nome: string): VariavelInterface;
    registrarReferenciaFuncao(idFuncao: string, funcao: DeleguaFuncao): void;
}
