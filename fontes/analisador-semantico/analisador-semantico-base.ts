import {
    Atribuir,
    AcessoIndiceVariavel,
    AcessoElementoMatriz,
    AcessoMetodoOuPropriedade,
    Agrupamento,
    AtribuicaoPorIndice,
    AtribuicaoPorIndicesMatriz,
    Binario,
    Chamada,
    DefinirValor,
    FuncaoConstruto,
    Dicionario,
    ExpressaoRegular,
    FimPara,
    FormatacaoEscrita,
    Isto,
    Literal,
    Logico,
    Super,
    Tupla,
    TipoDe,
    Unario,
    Vetor,
} from '../construtos';
import {
    Declaracao,
    TendoComo,
    InicioAlgoritmo,
    Aleatorio,
    CabecalhoPrograma,
    Classe,
    Const,
    ConstMultiplo,
    Expressao,
    FuncaoDeclaracao,
    Enquanto,
    Escolha,
    Escreva,
    Fazer,
    Importar,
    Para,
    ParaCada,
    Se,
    Tente,
    Var,
    VarMultiplo,
    Bloco,
    Continua,
    EscrevaMesmaLinha,
    Falhar,
    Leia,
    LeiaMultiplo,
    Retorna,
    Sustar,
} from '../declaracoes';
import { DeleguaFuncao } from '../estruturas';
import { AnalisadorSemanticoInterface } from '../interfaces/analisador-semantico-interface';
import { RetornoAnalisadorSemantico } from '../interfaces/retornos/retorno-analisador-semantico';
import { ContinuarQuebra, RetornoQuebra, SustarQuebra } from '../quebras';

/**
 * Essa classe só existe para eliminar redundância entre todos os analisadores
 * sintáticos. Por padrão, quando um método não é implementado, ao invés de dar erro,
 * simplesmente passa por ele (`return Promise.resolve()`).
 */
export abstract class AnalisadorSemanticoBase implements AnalisadorSemanticoInterface {
    abstract analisar(declaracoes: Declaracao[]): RetornoAnalisadorSemantico;

    visitarDeclaracaoTendoComo(declaracao: TendoComo): Promise<any> {
        return Promise.resolve();
    }

    visitarDeclaracaoInicioAlgoritmo(declaracao: InicioAlgoritmo): Promise<any> {
        return Promise.resolve();
    }

    visitarDeclaracaoAleatorio(declaracao: Aleatorio): Promise<any> {
        return Promise.resolve();
    }

    visitarDeclaracaoCabecalhoPrograma(declaracao: CabecalhoPrograma): Promise<any> {
        return Promise.resolve();
    }

    visitarDeclaracaoClasse(declaracao: Classe): Promise<any> {
        return Promise.resolve();
    }

    visitarDeclaracaoConst(declaracao: Const): Promise<any> {
        return Promise.resolve();
    }

    visitarDeclaracaoConstMultiplo(declaracao: ConstMultiplo): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoDeAtribuicao(expressao: Atribuir): Promise<any> {
        return Promise.resolve();
    }

    visitarDeclaracaoDeExpressao(declaracao: Expressao): Promise<any> {
        return Promise.resolve();
    }

    visitarDeclaracaoDefinicaoFuncao(declaracao: FuncaoDeclaracao): void {
        // Nada acontece.
    }

    visitarDeclaracaoEnquanto(declaracao: Enquanto): Promise<any> {
        return Promise.resolve();
    }

    visitarDeclaracaoEscolha(declaracao: Escolha): Promise<any> {
        return Promise.resolve();
    }

    visitarDeclaracaoEscreva(declaracao: Escreva): Promise<any> {
        return Promise.resolve();
    }

    visitarDeclaracaoFazer(declaracao: Fazer): Promise<any> {
        return Promise.resolve();
    }

    visitarDeclaracaoImportar(declaracao: Importar): Promise<any> {
        return Promise.resolve();
    }

    visitarDeclaracaoPara(declaracao: Para): Promise<any> {
        return Promise.resolve();
    }

    visitarDeclaracaoParaCada(declaracao: ParaCada): Promise<any> {
        return Promise.resolve();
    }

    visitarDeclaracaoSe(declaracao: Se): Promise<any> {
        return Promise.resolve();
    }

    visitarDeclaracaoTente(declaracao: Tente): Promise<any> {
        return Promise.resolve();
    }

    visitarDeclaracaoVar(declaracao: Var): Promise<any> {
        return Promise.resolve();
    }

    visitarDeclaracaoVarMultiplo(declaracao: VarMultiplo): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoAcessoIndiceVariavel(expressao: AcessoIndiceVariavel): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoAcessoElementoMatriz(expressao: AcessoElementoMatriz): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoAcessoMetodo(expressao: AcessoMetodoOuPropriedade): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoAgrupamento(expressao: Agrupamento): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoAtribuicaoPorIndice(expressao: AtribuicaoPorIndice): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoAtribuicaoPorIndicesMatriz(expressao: AtribuicaoPorIndicesMatriz): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoBinaria(expressao: Binario): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoBloco(declaracao: Bloco): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoContinua(declaracao?: Continua): ContinuarQuebra {
        return Promise.resolve();
    }

    visitarExpressaoDeChamada(expressao: Chamada): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoDefinirValor(expressao: DefinirValor): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoDeleguaFuncao(expressao: FuncaoConstruto): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoDeVariavel(expressao: Var): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoDicionario(expressao: Dicionario): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoExpressaoRegular(expressao: ExpressaoRegular): Promise<RegExp> {
        return;
    }

    visitarDeclaracaoEscrevaMesmaLinha(declaracao: EscrevaMesmaLinha): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoFalhar(expressao: Falhar): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoFimPara(declaracao: FimPara): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoFormatacaoEscrita(declaracao: FormatacaoEscrita): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoIsto(expressao: Isto): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoLeia(expressao: Leia): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoLeiaMultiplo(expressao: LeiaMultiplo): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoLiteral(expressao: Literal): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoLogica(expressao: Logico): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoRetornar(declaracao: Retorna): Promise<RetornoQuebra> {
        return;
    }

    visitarExpressaoSuper(expressao: Super): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoSustar(declaracao?: Sustar): SustarQuebra {
        return Promise.resolve();
    }

    visitarExpressaoTupla(expressao: Tupla): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoTipoDe(expressao: TipoDe): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoUnaria(expressao: Unario): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoVetor(expressao: Vetor): Promise<any> {
        return Promise.resolve();
    }
}
