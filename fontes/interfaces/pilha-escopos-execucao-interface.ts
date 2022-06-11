import { DeleguaFuncao } from "../estruturas";
import { EscopoExecucao } from "./escopo-execucao";
import { PilhaInterface } from "./pilha-interface";
import { SimboloInterface } from "./simbolo-interface";

export interface PilhaEscoposExecucaoInterface extends PilhaInterface<EscopoExecucao> {
    atribuirVariavel(simbolo: SimboloInterface, valor: any): void;
    atribuirVariavelEm(distancia: number, simbolo: any, valor: any): void;
    definirVariavel(nomeVariavel: string, valor: any): void;
    elementos(): number;
    naPosicao(posicao: number): EscopoExecucao;
    obterTodasVariaveis(todasVariaveis: any[]): any[];
    obterVariavel(simbolo: SimboloInterface): any;
    obterVariavelEm(distancia: number, nome: string): any;
    obterTodasDeleguaFuncao(): { [nome: string]: DeleguaFuncao };
}
