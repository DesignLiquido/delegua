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
    peek(): any;
    voltar(): any;
    seek(posicao: number): any;
    estaNoFinal(): boolean;
    avancar(): any;
    match(...argumentos: any[]): boolean;
    primario(): any;
    finalizarChamada(callee: any): any;
    chamar(): any;
    unario(): any;
    exponent(): any;
    multiplicar(): any;
    adicionar(): any;
    bitFill(): any;
    bitE(): any;
    bitOu(): any;
    comparar(): any;
    equality(): any;
    em(): any;
    e(): any;
    ou(): any;
    atribuir(): any;
    expressao(): any;
    declaracaoMostrar(): any;
    expressionStatement(): any;
    block(): any;
    declaracaoSe(): any;
    whileStatement(): any;
    forStatement(): any;
    breakStatement(): any;
    declaracaoContinue(): any;
    declaracaoRetorna(): any;
    declaracaoEscolha(): any;
    importStatement(): any;
    tryStatement(): any;
    doStatement(): any;
    statement(): any;
    declaracaoDeVariavel(): any;
    funcao(kind: any): any;
    corpoDaFuncao(kind: any): any;
    declaracaoDeClasse(): any;
    declaracao(): any;
    analisar(): any;
}