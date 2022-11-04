import { ErroAvaliadorSintatico } from '../avaliador-sintatico/erro-avaliador-sintatico';
import { RetornoAvaliadorSintatico } from './retornos/retorno-avaliador-sintatico';
import { Construto, Funcao } from '../construtos';
import {
    Classe,
    Continua,
    Enquanto,
    Escolha,
    Escreva,
    Expressao,
    Fazer,
    Funcao as FuncaoDeclaracao,
    Importar,
    Para,
    Retorna,
    Se,
    Sustar,
    Tente,
    Var,
} from '../declaracoes';
import { RetornoLexador } from './retornos/retorno-lexador';

import { SimboloInterface } from './simbolo-interface';

export interface AvaliadorSintaticoInterface {
    simbolos: SimboloInterface[];
    erros: ErroAvaliadorSintatico[];

    atual: number;
    ciclos: number;

    // sincronizar(): void;
    consumir(tipo: any, mensagemDeErro: string): any;
    erro(simbolo: SimboloInterface, mensagemDeErro: string): ErroAvaliadorSintatico;
    verificarTipoSimboloAtual(tipo: string): boolean;
    verificarTipoProximoSimbolo(tipo: string): boolean;
    estaNoFinal(): boolean;
    avancarEDevolverAnterior(): any;
    verificarSeSimboloAtualEIgualA(...argumentos: any[]): boolean;
    primario(): any;
    finalizarChamada(entidadeChamada: Construto): Construto;
    chamar(): Construto;
    unario(): Construto;
    exponenciacao(): Construto;
    multiplicar(): Construto;
    adicaoOuSubtracao(): Construto;
    bitFill(): Construto;
    bitE(): Construto;
    bitOu(): Construto;
    comparar(): Construto;
    comparacaoIgualdade(): Construto;
    em(): Construto;
    e(): Construto;
    ou(): Construto;
    atribuir(): Construto;
    expressao(): Construto;
    declaracaoEscreva(): Escreva;
    declaracaoExpressao(): Expressao;
    blocoEscopo(): any[];
    declaracaoSe(): Se;
    declaracaoEnquanto(): Enquanto;
    declaracaoPara(): Para;
    declaracaoSustar(): Sustar;
    declaracaoContinua(): Continua;
    declaracaoRetorna(): Retorna;
    declaracaoEscolha(): Escolha;
    declaracaoImportar(): Importar;
    declaracaoTente(): Tente;
    declaracaoFazer(): Fazer;
    resolverDeclaracao(): any;
    declaracaoDeVariavel(): Var;
    funcao(tipo: string): FuncaoDeclaracao;
    corpoDaFuncao(tipo: string): Funcao;
    declaracaoDeClasse(): Classe;
    declaracao(): any;
    analisar(retornoLexador: RetornoLexador, hashArquivo?: number): RetornoAvaliadorSintatico;
}
