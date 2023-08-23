import { ErroAvaliadorSintatico } from '../avaliador-sintatico/erro-avaliador-sintatico';
import { RetornoAvaliadorSintatico } from './retornos/retorno-avaliador-sintatico';
import { Construto, FuncaoConstruto } from '../construtos';
import {
    Classe,
    Const,
    Continua,
    Enquanto,
    Escolha,
    Escreva,
    Expressao,
    Fazer,
    FuncaoDeclaracao as FuncaoDeclaracao,
    Importar,
    Leia,
    Para,
    ParaCada,
    Retorna,
    Se,
    Sustar,
    Tente,
    Var,
} from '../declaracoes';
import { RetornoLexador } from './retornos/retorno-lexador';

export interface AvaliadorSintaticoInterface<TSimbolo, TDeclaracao> {
    simbolos: TSimbolo[];
    erros: ErroAvaliadorSintatico[];

    atual: number;
    blocos: number;

    consumir(tipo: any, mensagemDeErro: string): any;
    erro(simbolo: TSimbolo, mensagemDeErro: string): ErroAvaliadorSintatico;
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
    bitShift(): Construto;
    bitE(): Construto;
    bitOu(): Construto;
    comparar(): Construto;
    comparacaoIgualdade(): Construto;
    em(): Construto;
    e(): Construto;
    ou(): Construto;
    atribuir(): Construto;
    blocoEscopo(): any[];
    expressao(): Construto;
    declaracaoEnquanto(): Enquanto;
    declaracaoEscreva(): Escreva;
    declaracaoExpressao(): Expressao;
    declaracaoLeia(): Leia;
    declaracaoPara(): Para | ParaCada;
    declaracaoSe(): Se;
    declaracaoSustar(): Sustar;
    declaracaoContinua(): Continua;
    declaracaoRetorna(): Retorna;
    declaracaoEscolha(): Escolha;
    declaracaoImportar(): Importar;
    declaracaoTente(): Tente;
    declaracaoFazer(): Fazer;
    resolverDeclaracao(): any;
    declaracaoDeConstantes(): Const[];
    declaracaoDeVariaveis(): Var[];
    declaracaoDeVariavel(): Var;
    funcao(tipo: string): FuncaoDeclaracao;
    corpoDaFuncao(tipo: string): FuncaoConstruto;
    declaracaoDeClasse(): Classe;
    resolverDeclaracaoForaDeBloco(): any;
    analisar(retornoLexador: RetornoLexador<TSimbolo>, hashArquivo: number): RetornoAvaliadorSintatico<TDeclaracao>;
}
