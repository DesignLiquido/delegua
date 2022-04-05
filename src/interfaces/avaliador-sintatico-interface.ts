import { SimboloInterface } from "./simbolo-interface";

export interface AvaliadorSintaticoInterface {
    simbolos: SimboloInterface[];
    Delegua: any;
  
    atual: number;
    ciclos: number;

    sincronizar(): void;
    erro(simbolo: any, mensagemDeErro: any): any;
    consumir(tipo: any, mensagemDeErro: any): any;
    verificarTipoSimboloAtual(tipo: any): boolean;
    verificarTipoProximoSimbolo(tipo: any): boolean;
    simboloAtual(): any;
    simboloAnterior(): any;
    simboloNaPosicao(posicao: number): any;
    estaNoFinal(): boolean;
    avancar(): any;
    verificarSeSimboloAtualEIgualA(...argumentos: any[]): boolean;
    primario(): any;
    finalizarChamada(entidadeChamada: any): any;
    chamar(): any;
    unario(): any;
    exponenciacao(): any;
    multiplicar(): any;
    adicionar(): any;
    bitFill(): any;
    bitE(): any;
    bitOu(): any;
    comparar(): any;
    comparacaoIgualdade(): any;
    em(): any;
    e(): any;
    ou(): any;
    atribuir(): any;
    expressao(): any;
    declaracaoEscreva(): any;
    declaracaoExpressao(): any;
    blocoEscopo(): any;
    declaracaoSe(): any;
    declaracaoEnquanto(): any;
    declaracaoPara(): any;
    declaracaoInterromper(): any;
    declaracaoContinua(): any;
    declaracaoRetorna(): any;
    declaracaoEscolha(): any;
    declaracaoImportar(): any;
    declaracaoTentar(): any;
    declaracaoFazer(): any;
    resolverDeclaracao(): any;
    declaracaoDeVariavel(): any;
    funcao(kind: any): any;
    corpoDaFuncao(kind: any): any;
    declaracaoDeClasse(): any;
    declaracao(): any;
    analisar(simbolos?: SimboloInterface[]): any
}