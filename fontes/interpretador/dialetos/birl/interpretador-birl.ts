import { Construto, Atribuir, Literal, FimPara, FormatacaoEscrita, Super } from "../../../construtos";
import { Declaracao, Expressao, Leia, Para, ParaCada, Se, Fazer, Escolha, Tente, Enquanto, Importar, Escreva, EscrevaMesmaLinha, Bloco, Var, Const, Continua, Sustar, Retorna, FuncaoDeclaracao, Classe } from "../../../declaracoes";
import { EspacoVariaveis } from "../../../espaco-variaveis";
import { InterpretadorInterface } from "../../../interfaces";
import { PilhaEscoposExecucaoInterface } from "../../../interfaces/pilha-escopos-execucao-interface";
import { RetornoInterpretador } from "../../../interfaces/retornos";
import { ContinuarQuebra, SustarQuebra, RetornoQuebra } from "../../../quebras";

export class InterpretadorBirl implements InterpretadorInterface {
    diretorioBase: any;
    funcaoDeRetorno: Function;
    pilhaEscoposExecucao: PilhaEscoposExecucaoInterface;
    interfaceEntradaSaida: any;
    avaliar(expressao: Construto | Declaracao) {
        throw new Error("Method not implemented.");
    }
    executarBloco(declaracoes: Declaracao[], ambiente?: EspacoVariaveis): Promise<any> {
        throw new Error("Method not implemented.");
    }
    paraTexto(objeto: any) {
        throw new Error("Method not implemented.");
    }
    executar(declaracao: Declaracao, mostrarResultado: boolean) {
        throw new Error("Method not implemented.");
    }
    interpretar(declaracoes: Declaracao[], manterAmbiente?: boolean): Promise<RetornoInterpretador> {
        throw new Error("Method not implemented.");
    }
    visitarExpressaoAgrupamento(expressao: any): Promise<any> {
        throw new Error("Method not implemented.");
    }
    visitarExpressaoUnaria(expressao: any) {
        throw new Error("Method not implemented.");
    }
    visitarExpressaoBinaria(expressao: any) {
        throw new Error("Method not implemented.");
    }
    visitarExpressaoDeChamada(expressao: any) {
        throw new Error("Method not implemented.");
    }
    visitarDeclaracaoDeAtribuicao(expressao: Atribuir) {
        throw new Error("Method not implemented.");
    }
    visitarExpressaoDeVariavel(expressao: any) {
        throw new Error("Method not implemented.");
    }
    visitarDeclaracaoDeExpressao(declaracao: Expressao) {
        throw new Error("Method not implemented.");
    }
    visitarExpressaoLeia(expressao: Leia) {
        throw new Error("Method not implemented.");
    }
    visitarExpressaoLiteral(expressao: Literal): Promise<any> {
        throw new Error("Method not implemented.");
    }
    visitarExpressaoLogica(expressao: any) {
        throw new Error("Method not implemented.");
    }
    visitarDeclaracaoPara(declaracao: Para): Promise<any> {
        throw new Error("Method not implemented.");
    }
    visitarDeclaracaoParaCada(declaracao: ParaCada): Promise<any> {
        throw new Error("Method not implemented.");
    }
    visitarDeclaracaoSe(declaracao: Se) {
        throw new Error("Method not implemented.");
    }
    visitarExpressaoFimPara(declaracao: FimPara) {
        throw new Error("Method not implemented.");
    }
    visitarDeclaracaoFazer(declaracao: Fazer) {
        throw new Error("Method not implemented.");
    }
    visitarExpressaoFormatacaoEscrita(declaracao: FormatacaoEscrita) {
        throw new Error("Method not implemented.");
    }
    visitarDeclaracaoEscolha(declaracao: Escolha) {
        throw new Error("Method not implemented.");
    }
    visitarDeclaracaoTente(declaracao: Tente) {
        throw new Error("Method not implemented.");
    }
    visitarDeclaracaoEnquanto(declaracao: Enquanto) {
        throw new Error("Method not implemented.");
    }
    visitarDeclaracaoImportar(declaracao: Importar) {
        throw new Error("Method not implemented.");
    }
    visitarDeclaracaoEscreva(declaracao: Escreva) {
        throw new Error("Method not implemented.");
    }
    visitarExpressaoEscrevaMesmaLinha(declaracao: EscrevaMesmaLinha) {
        throw new Error("Method not implemented.");
    }
    visitarExpressaoBloco(declaracao: Bloco): Promise<any> {
        throw new Error("Method not implemented.");
    }
    visitarDeclaracaoVar(declaracao: Var): Promise<any> {
        throw new Error("Method not implemented.");
    }
    visitarDeclaracaoConst(declaracao: Const): Promise<any> {
        throw new Error("Method not implemented.");
    }
    visitarExpressaoContinua(declaracao?: Continua): ContinuarQuebra {
        throw new Error("Method not implemented.");
    }
    visitarExpressaoSustar(declaracao?: Sustar): SustarQuebra {
        throw new Error("Method not implemented.");
    }
    visitarExpressaoRetornar(declaracao: Retorna): Promise<RetornoQuebra> {
        throw new Error("Method not implemented.");
    }
    visitarExpressaoDeleguaFuncao(expressao: any) {
        throw new Error("Method not implemented.");
    }
    visitarExpressaoAtribuicaoSobrescrita(expressao: any): Promise<any> {
        throw new Error("Method not implemented.");
    }
    visitarExpressaoAcessoIndiceVariavel(expressao: any) {
        throw new Error("Method not implemented.");
    }
    visitarExpressaoDefinirValor(expressao: any) {
        throw new Error("Method not implemented.");
    }
    visitarDeclaracaoDefinicaoFuncao(declaracao: FuncaoDeclaracao) {
        throw new Error("Method not implemented.");
    }
    visitarDeclaracaoClasse(declaracao: Classe) {
        throw new Error("Method not implemented.");
    }
    visitarExpressaoAcessoMetodo(expressao: any) {
        throw new Error("Method not implemented.");
    }
    visitarExpressaoIsto(expressao: any) {
        throw new Error("Method not implemented.");
    }
    visitarExpressaoDicionario(expressao: any) {
        throw new Error("Method not implemented.");
    }
    visitarExpressaoVetor(expressao: any) {
        throw new Error("Method not implemented.");
    }
    visitarExpressaoSuper(expressao: Super) {
        throw new Error("Method not implemented.");
    }

}
