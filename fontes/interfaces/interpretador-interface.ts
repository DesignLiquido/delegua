import { Ambiente } from "../ambiente";
import { Atribuir, Construto, Literal, Super } from "../construtos";
import { Bloco, Classe, Continua, Declaracao, Enquanto, Escolha, Escreva, Expressao, Fazer, Funcao, Importar, Para, Retorna, Se, Sustar, Tente, Var } from "../declaracoes";
import { ContinuarQuebra, RetornoQuebra, SustarQuebra } from "../quebras";
import { PilhaEscoposExecucaoInterface } from "./pilha-escopos-execucao-interface";

import { RetornoInterpretador } from "./retornos/retorno-interpretador";
import { SimboloInterface } from "./simbolo-interface";

export interface InterpretadorInterface {
    diretorioBase: any;
    funcaoDeRetorno: Function;
    locais: Map<Construto, number>;
    pilhaEscoposExecucao: PilhaEscoposExecucaoInterface;

    visitarExpressaoLiteral(expressao: Literal): any;
    avaliar(expressao: any): any;
    visitarExpressaoAgrupamento(expressao: any): any;
    eVerdadeiro(objeto: any): boolean;
    verificarOperandoNumero(operador: any, operand: any): void;
    visitarExpressaoUnaria(expressao: any): any;
    eIgual(esquerda: any, direita: any): boolean;
    verificarOperandosNumeros(operador: any, direita: any, esquerda: any): void;
    visitarExpressaoBinaria(expressao: any): any;
    visitarExpressaoDeChamada(expressao: any): any;
    visitarExpressaoDeAtribuicao(expressao: Atribuir): any;
    procurarVariavel(nome: SimboloInterface, expressao: any): any;
    visitarExpressaoDeVariavel(expressao: any): any;
    visitarDeclaracaoDeExpressao(declaracao: Expressao): any;
    visitarExpressaoLogica(expressao: any): any;
    visitarExpressaoSe(declaracao: Se): any;
    visitarExpressaoPara(declaracao: Para): any;
    visitarExpressaoFazer(declaracao: Fazer): any;
    visitarExpressaoEscolha(declaracao: Escolha): any;
    visitarExpressaoTente(declaracao: Tente): any;
    visitarExpressaoEnquanto(declaracao: Enquanto): any;
    visitarExpressaoImportar(declaracao: Importar): any;
    visitarExpressaoEscreva(declaracao: Escreva): any;
    executarBloco(declaracoes: Declaracao[], ambiente?: Ambiente): void;
    visitarExpressaoBloco(declaracao: Bloco): null;
    visitarExpressaoVar(declaracao: Var): null;
    visitarExpressaoContinua(declaracao?: Continua): ContinuarQuebra;
    visitarExpressaoSustar(declaracao?: Sustar): SustarQuebra;
    visitarExpressaoRetornar(declaracao: Retorna): RetornoQuebra;
    visitarExpressaoDeleguaFuncao(expressao: any): any;
    visitarExpressaoAtribuicaoSobrescrita(expressao: any): void;
    visitarExpressaoAcessoIndiceVariavel(expressao: any): any;
    visitarExpressaoDefinir(expressao: any): any;
    visitarExpressaoFuncao(declaracao: Funcao): any;
    visitarExpressaoClasse(declaracao: Classe): any;
    visitarExpressaoAcessoMetodo(expressao: any): any;
    visitarExpressaoIsto(expressao: any): any;
    visitarExpressaoDicionario(expressao: any): any;
    visitarExpressaoVetor(expressao: any): any;
    visitarExpressaoSuper(expressao: Super): any;
    paraTexto(objeto: any): any;
    executar(declaracao: Declaracao, mostrarResultado: boolean): any;
    interpretar(declaracoes: Declaracao[], manterAmbiente?: boolean): RetornoInterpretador;
}