import { ErroAvaliador } from '../avaliador-sintatico/erros-avaliador';
import { Construto, Funcao } from '../construtos';
import {
    Classe,
    Continua,
    Declaracao,
    Enquanto,
    Escolha,
    Escreva,
    Fazer,
    Funcao as FuncaoDeclaracao,
    Importar,
    Para,
    Retorna,
    Se,
    Tente,
    Var,
} from '../declaracoes';
import { Delegua } from '../delegua';
import { SimboloInterface } from './simbolo-interface';

export interface AvaliadorSintaticoInterface {
    simbolos: SimboloInterface[];
    Delegua: Delegua;

    atual: number;
    ciclos: number;

    sincronizar(): void;
    erro(simbolo: any, mensagemDeErro: string): ErroAvaliador;
    consumir(tipo: any, mensagemDeErro: any): any;
    verificarTipoSimboloAtual(tipo: any): boolean;
    verificarTipoProximoSimbolo(tipo: any): boolean;
    simboloAtual(): SimboloInterface;
    simboloAnterior(): SimboloInterface;
    simboloNaPosicao(posicao: number): SimboloInterface;
    estaNoFinal(): boolean;
    avancar(): any;
    verificarSeSimboloAtualEIgualA(...argumentos: any[]): boolean;
    primario(): any;
    finalizarChamada(entidadeChamada: Construto): Construto;
    chamar(): Construto;
    unario(): Construto;
    exponenciacao(): Construto;
    multiplicar(): Construto;
    adicionar(): Construto;
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
    declaracaoExpressao(): any;
    blocoEscopo(): any;
    declaracaoSe(): Se;
    declaracaoEnquanto(): Enquanto;
    declaracaoPara(): Para;
    declaracaoInterromper(): any;
    declaracaoContinua(): Continua;
    declaracaoRetorna(): Retorna;
    declaracaoEscolha(): Escolha;
    declaracaoImportar(): Importar;
    declaracaoTente(): Tente;
    declaracaoFazer(): Fazer;
    resolverDeclaracao(): any;
    declaracaoDeVariavel(): Var;
    funcao(tipo: any): FuncaoDeclaracao;
    corpoDaFuncao(tipo: any): Funcao;
    declaracaoDeClasse(): Classe;
    declaracao(): any;
    analisar(simbolos?: SimboloInterface[]): Declaracao[];
}
