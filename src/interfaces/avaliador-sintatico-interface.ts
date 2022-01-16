import { SimboloInterface } from "./simbolo-interface";

export interface AvaliadorSintaticoInterface {
    simbolos: SimboloInterface[];
    Delegua: any;
  
    atual: number;
    ciclos: number;

    sincronizar(): void;
    erro(simbolo: any, mensagemDeErro: any): any;
    consumir(tipo: any, mensagemDeErro: any): any;
    verificar(tipo: any): boolean;
    verificarProximo(tipo: any): boolean;
    simboloAtual(): any;
    voltar(): any;
    seek(posicao: number): any;
    estaNoFinal(): boolean;
    avancar(): any;
    verificarSeSimboloAtualEIgualA(...argumentos: any[]): boolean;
    primario(): any;
    finalizarChamada(callee: any): any;
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
    declaracaoMostrar(): any;
    declaracaoExpressao(): any;
    blocoEscopo(): any;
    declaracaoSe(): any;
    declaracaoEnquanto(): any;
    declaracaoPara(): any;
    breakStatement(): any;
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