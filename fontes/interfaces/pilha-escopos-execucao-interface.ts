import { DeleguaFuncao } from '../estruturas';
import { EscopoExecucao } from './escopo-execucao';
import { PilhaInterface } from './pilha-interface';
import { SimboloInterface } from './simbolo-interface';
import { VariavelInterface } from './variavel-interface';

export interface PilhaEscoposExecucaoInterface extends PilhaInterface<EscopoExecucao> {
    atribuirVariavel(simbolo: SimboloInterface, valor: any): void;
    atribuirVariavelEm(distancia: number, simbolo: SimboloInterface, valor: any): void;
    definirConstante(nomeConstante: string, valor: any, subtipo?: string): void;
    definirVariavel(nomeVariavel: string, valor: any, subtipo?: string, imutavel?: boolean): void;
    elementos(): number;
    naPosicao(posicao: number): EscopoExecucao;
    obterEscopoPorTipo(idChamada: string): EscopoExecucao | undefined;
    obterTodasVariaveis(todasVariaveis: any[]): { valor: any; nome: string; tipo: string }[];
    obterValorVariavel(simbolo: SimboloInterface): VariavelInterface;
    obterVariavelEm(distancia: number, nome: string): VariavelInterface;
    obterVariavelPorNome(nome: string): VariavelInterface;
    obterTodasDeclaracaoClasse(): any;
    obterTodasDeleguaFuncao(): { [nome: string]: DeleguaFuncao };
}
