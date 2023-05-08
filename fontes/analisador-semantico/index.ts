import { Literal, Construto, Atribuir, FimPara, FormatacaoEscrita, Super } from "../construtos";
import { Declaracao, Expressao, Leia, Para, ParaCada, Se, Fazer, Escolha, Tente, Enquanto, Importar, Escreva, EscrevaMesmaLinha, Bloco, Var, Const, Continua, Sustar, Retorna, FuncaoDeclaracao, Classe } from "../declaracoes";
import { AnalisadorSemanticoInterface } from "../interfaces/analisador-semantico-interface";
import { RetornoAnalisadorSemantico } from "../interfaces/retornos/retorno-analisador-semantico";
import { ContinuarQuebra, SustarQuebra, RetornoQuebra } from "../quebras";
import { PilhaVariaveis } from "./pilha-variaveis";

export class AnalisadorSemantico implements AnalisadorSemanticoInterface {
    pilhaVariaveis: PilhaVariaveis;
    atual: number;

    constructor() {
        this.pilhaVariaveis = new PilhaVariaveis();
        this.atual = 0;
    }

    visitarExpressaoLiteral(expressao: Literal): Promise<any> {
        throw new Error("Método não implementado.");
    }
    avaliar(expressao: Construto | Declaracao) {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoAgrupamento(expressao: any): Promise<any> {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoUnaria(expressao: any) {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoBinaria(expressao: any) {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoDeChamada(expressao: any) {
        throw new Error("Método não implementado.");
    }
    visitarDeclaracaoDeAtribuicao(expressao: Atribuir) {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoDeVariavel(expressao: any) {
        throw new Error("Método não implementado.");
    }
    visitarDeclaracaoDeExpressao(declaracao: Expressao) {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoLeia(expressao: Leia) {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoLogica(expressao: any) {
        throw new Error("Método não implementado.");
    }
    visitarDeclaracaoPara(declaracao: Para): Promise<any> {
        throw new Error("Método não implementado.");
    }
    visitarDeclaracaoParaCada(declaracao: ParaCada): Promise<any> {
        throw new Error("Método não implementado.");
    }
    visitarDeclaracaoSe(declaracao: Se) {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoFimPara(declaracao: FimPara) {
        throw new Error("Método não implementado.");
    }
    visitarDeclaracaoFazer(declaracao: Fazer) {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoFormatacaoEscrita(declaracao: FormatacaoEscrita) {
        throw new Error("Método não implementado.");
    }
    visitarDeclaracaoEscolha(declaracao: Escolha) {
        throw new Error("Método não implementado.");
    }
    visitarDeclaracaoTente(declaracao: Tente) {
        throw new Error("Método não implementado.");
    }
    visitarDeclaracaoEnquanto(declaracao: Enquanto) {
        throw new Error("Método não implementado.");
    }
    visitarDeclaracaoImportar(declaracao: Importar) {
        throw new Error("Método não implementado.");
    }
    visitarDeclaracaoEscreva(declaracao: Escreva) {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoEscrevaMesmaLinha(declaracao: EscrevaMesmaLinha) {
        throw new Error("Método não implementado.");
    }
    
    visitarExpressaoBloco(declaracao: Bloco): Promise<any> {
        throw new Error("Método não implementado.");
    }
    visitarDeclaracaoVar(declaracao: Var): Promise<any> {
        throw new Error("Método não implementado.");
    }
    visitarDeclaracaoConst(declaracao: Const): Promise<any> {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoContinua(declaracao?: Continua): ContinuarQuebra {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoSustar(declaracao?: Sustar): SustarQuebra {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoRetornar(declaracao: Retorna): Promise<RetornoQuebra> {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoDeleguaFuncao(expressao: any) {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoAtribuicaoSobrescrita(expressao: any): Promise<any> {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoAcessoIndiceVariavel(expressao: any) {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoDefinirValor(expressao: any) {
        throw new Error("Método não implementado.");
    }
    visitarDeclaracaoDefinicaoFuncao(declaracao: FuncaoDeclaracao) {
        throw new Error("Método não implementado.");
    }
    visitarDeclaracaoClasse(declaracao: Classe) {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoAcessoMetodo(expressao: any) {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoIsto(expressao: any) {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoDicionario(expressao: any) {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoVetor(expressao: any) {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoSuper(expressao: Super) {
        throw new Error("Método não implementado.");
    }

    analisar(declaracoes: Declaracao[]): RetornoAnalisadorSemantico {
        this.pilhaVariaveis = new PilhaVariaveis();
        this.atual = 0;

        while (this.atual < declaracoes.length) {
            declaracoes[this.atual].aceitar(this);
        }
        return {} as RetornoAnalisadorSemantico;
    }
}