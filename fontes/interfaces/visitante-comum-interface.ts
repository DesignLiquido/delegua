import {
    AcessoElementoMatriz,
    AcessoIndiceVariavel,
    AcessoMetodoOuPropriedade,
    Agrupamento,
    AtribuicaoPorIndice,
    AtribuicaoPorIndicesMatriz,
    Atribuir,
    Binario,
    Chamada,
    Constante,
    DefinirValor,
    Dicionario,
    ExpressaoRegular,
    FimPara,
    FormatacaoEscrita,
    FuncaoConstruto,
    Isto,
    Literal,
    Logico,
    Super,
    TipoDe,
    Tupla,
    Unario,
    Variavel,
    Vetor,
} from '../construtos';
import {
    Aleatorio,
    Bloco,
    CabecalhoPrograma,
    Classe,
    Const,
    ConstMultiplo,
    Continua,
    Enquanto,
    Escolha,
    Escreva,
    EscrevaMesmaLinha,
    Expressao,
    Falhar,
    Fazer,
    FuncaoDeclaracao,
    Importar,
    InicioAlgoritmo,
    Leia,
    LeiaMultiplo,
    Para,
    ParaCada,
    Retorna,
    Se,
    Sustar,
    TendoComo,
    Tente,
    Var,
    VarMultiplo,
} from '../declaracoes';
import { ContinuarQuebra, RetornoQuebra, SustarQuebra } from '../quebras';

export interface VisitanteComumInterface {
    visitarDeclaracaoAleatorio(declaracao: Aleatorio): Promise<any>;
    visitarDeclaracaoCabecalhoPrograma(declaracao: CabecalhoPrograma): Promise<any>;
    visitarDeclaracaoClasse(declaracao: Classe): Promise<any> | void;
    visitarDeclaracaoConst(declaracao: Const): Promise<any>;
    visitarDeclaracaoConstMultiplo(declaracao: ConstMultiplo): Promise<any>;
    visitarDeclaracaoDeExpressao(declaracao: Expressao): Promise<any> | void;
    visitarDeclaracaoDefinicaoFuncao(declaracao: FuncaoDeclaracao): void;
    visitarDeclaracaoEnquanto(declaracao: Enquanto): Promise<any> | void;
    visitarDeclaracaoEscolha(declaracao: Escolha): Promise<any> | void;
    visitarDeclaracaoEscreva(declaracao: Escreva): Promise<any> | void;
    visitarDeclaracaoEscrevaMesmaLinha(declaracao: EscrevaMesmaLinha): Promise<any> | void;
    visitarDeclaracaoFazer(declaracao: Fazer): Promise<any> | void;
    visitarDeclaracaoImportar(declaracao: Importar): Promise<any> | void;
    visitarDeclaracaoInicioAlgoritmo(declaracao: InicioAlgoritmo): Promise<any>;
    visitarDeclaracaoPara(declaracao: Para): Promise<any>;
    visitarDeclaracaoParaCada(declaracao: ParaCada): Promise<any>;
    visitarDeclaracaoSe(declaracao: Se): Promise<any> | void;
    visitarDeclaracaoTendoComo(declaracao: TendoComo): Promise<any> | void;
    visitarDeclaracaoTente(declaracao: Tente): Promise<any> | void;
    visitarDeclaracaoVar(declaracao: Var): Promise<any>;
    visitarDeclaracaoVarMultiplo(declaracao: VarMultiplo): Promise<any>;
    visitarExpressaoDeAtribuicao(expressao: Atribuir): Promise<any> | void;
    visitarExpressaoAcessoIndiceVariavel(expressao: AcessoIndiceVariavel): Promise<any> | void;
    visitarExpressaoAcessoElementoMatriz(expressao: AcessoElementoMatriz): Promise<any> | void;
    visitarExpressaoAcessoMetodo(expressao: AcessoMetodoOuPropriedade): Promise<any> | void;
    visitarExpressaoAgrupamento(expressao: Agrupamento): Promise<any>;
    visitarExpressaoAtribuicaoPorIndice(expressao: AtribuicaoPorIndice): Promise<any>;
    visitarExpressaoAtribuicaoPorIndicesMatriz(expressao: AtribuicaoPorIndicesMatriz): Promise<any>;
    visitarExpressaoBinaria(expressao: Binario): Promise<any> | void;
    visitarExpressaoBloco(declaracao: Bloco): Promise<any>;
    visitarExpressaoContinua(declaracao?: Continua): ContinuarQuebra;
    visitarExpressaoDeChamada(expressao: Chamada): Promise<any> | void;
    visitarExpressaoDefinirValor(expressao: DefinirValor): Promise<any> | void;
    visitarExpressaoDeleguaFuncao(expressao: FuncaoConstruto): Promise<any> | void;
    visitarExpressaoDeVariavel(expressao: Variavel | Constante): Promise<any> | void;
    visitarExpressaoDicionario(expressao: Dicionario): Promise<any> | void;
    visitarExpressaoExpressaoRegular(expressao: ExpressaoRegular): Promise<RegExp>;
    visitarExpressaoFalhar(expressao: Falhar): Promise<any>;
    visitarExpressaoFimPara(declaracao: FimPara): Promise<any> | void;
    visitarExpressaoFormatacaoEscrita(declaracao: FormatacaoEscrita): Promise<any> | void;
    visitarExpressaoIsto(expressao: Isto): Promise<any> | void;
    visitarExpressaoLeia(expressao: Leia): Promise<any>;
    visitarExpressaoLeiaMultiplo(expressao: LeiaMultiplo): Promise<any>;
    visitarExpressaoLiteral(expressao: Literal): Promise<any>;
    visitarExpressaoLogica(expressao: Logico): Promise<any> | void;
    visitarExpressaoRetornar(declaracao: Retorna): Promise<RetornoQuebra>;
    visitarExpressaoSuper(expressao: Super): Promise<any> | void;
    visitarExpressaoSustar(declaracao?: Sustar): SustarQuebra;
    visitarExpressaoTupla(expressao: Tupla): Promise<any>;
    visitarExpressaoTipoDe(expressao: TipoDe): Promise<any>;
    visitarExpressaoUnaria(expressao: Unario): Promise<any> | void;
    visitarExpressaoVetor(expressao: Vetor): Promise<any> | void;
}
