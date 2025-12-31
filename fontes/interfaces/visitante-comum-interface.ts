import {
    AcessoElementoMatriz,
    AcessoIndiceVariavel,
    AcessoIntervaloVariavel,
    AcessoMetodo,
    AcessoMetodoOuPropriedade,
    AcessoPropriedade,
    Agrupamento,
    ArgumentoReferenciaFuncao,
    AtribuicaoPorIndice,
    AtribuicaoPorIndicesMatriz,
    Atribuir,
    Binario,
    Chamada,
    ComentarioComoConstruto,
    Constante,
    DefinirValor,
    Dicionario,
    ExpressaoRegular,
    FimPara,
    FormatacaoEscrita,
    FuncaoConstruto,
    Isto,
    Leia,
    Literal,
    Logico,
    ReferenciaFuncao,
    Separador,
    Super,
    TipoDe,
    Tupla,
    Unario,
    TuplaN,
    Variavel,
    Vetor,
} from '../construtos';

import {
    Bloco,
    CabecalhoPrograma,
    Classe,
    Comentario,
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
    InicioAlgoritmo,
    Para,
    Retorna,
    Se,
    Sustar,
    TendoComo,
    Tente,
    TextoDocumentacao,
    Var,
    VarMultiplo,
} from '../declaracoes';
import { ContinuarQuebra, SustarQuebra } from '../quebras';

export interface VisitanteComumInterface {
    visitarDeclaracaoCabecalhoPrograma(declaracao: CabecalhoPrograma): Promise<any> | void;
    visitarDeclaracaoClasse(declaracao: Classe): Promise<any> | void;
    visitarDeclaracaoComentario(declaracao: Comentario): Promise<any> | void;
    visitarDeclaracaoConst(declaracao: Const): Promise<any> | void;
    visitarDeclaracaoConstMultiplo(declaracao: ConstMultiplo): Promise<any> | void;
    visitarDeclaracaoDeExpressao(declaracao: Expressao): Promise<any> | void;
    visitarDeclaracaoDefinicaoFuncao(declaracao: FuncaoDeclaracao): Promise<any> | void;
    visitarDeclaracaoEnquanto(declaracao: Enquanto): Promise<any> | void;
    visitarDeclaracaoEscolha(declaracao: Escolha): Promise<any> | void;
    visitarDeclaracaoEscreva(declaracao: Escreva): Promise<any> | void;
    visitarDeclaracaoEscrevaMesmaLinha(declaracao: EscrevaMesmaLinha): Promise<any> | void;
    visitarDeclaracaoFazer(declaracao: Fazer): Promise<any> | void;
    visitarDeclaracaoInicioAlgoritmo(declaracao: InicioAlgoritmo): Promise<any> | void;
    visitarDeclaracaoPara(declaracao: Para): Promise<any> | void;
    visitarDeclaracaoSe(declaracao: Se): Promise<any> | void;
    visitarDeclaracaoTendoComo(declaracao: TendoComo): Promise<any> | void;
    visitarDeclaracaoTente(declaracao: Tente): Promise<any> | void;
    visitarDeclaracaoTextoDocumentacao(declaracao: TextoDocumentacao): Promise<any> | void;
    visitarDeclaracaoVar(declaracao: Var): Promise<any> | void;
    visitarDeclaracaoVarMultiplo(declaracao: VarMultiplo): Promise<any> | void;
    visitarExpressaoDeAtribuicao(expressao: Atribuir): Promise<any> | void;
    visitarExpressaoAcessoIndiceVariavel(expressao: AcessoIndiceVariavel): Promise<any> | void;
    visitarExpressaoAcessoIntervaloVariavel(expressao: AcessoIntervaloVariavel): Promise<any> | void;
    visitarExpressaoAcessoElementoMatriz(expressao: AcessoElementoMatriz): Promise<any> | void;
    visitarExpressaoAcessoMetodo(expressao: AcessoMetodo): Promise<any> | void;
    visitarExpressaoAcessoMetodoOuPropriedade(
        expressao: AcessoMetodoOuPropriedade
    ): Promise<any> | void;
    visitarExpressaoAcessoPropriedade(expressao: AcessoPropriedade): Promise<any> | void;
    visitarExpressaoAgrupamento(expressao: Agrupamento): Promise<any> | void;
    visitarExpressaoArgumentoReferenciaFuncao(
        expressao: ArgumentoReferenciaFuncao
    ): Promise<any> | void;
    visitarExpressaoAtribuicaoPorIndice(expressao: AtribuicaoPorIndice): Promise<any> | void;
    visitarExpressaoAtribuicaoPorIndicesMatriz(
        expressao: AtribuicaoPorIndicesMatriz
    ): Promise<any> | void;
    visitarExpressaoBinaria(expressao: Binario): Promise<any> | void;
    visitarExpressaoBloco(declaracao: Bloco): Promise<any>;
    visitarExpressaoComentario(expressao: ComentarioComoConstruto): Promise<any> | void;
    visitarExpressaoContinua(declaracao?: Continua): ContinuarQuebra;
    visitarExpressaoDeChamada(expressao: Chamada): Promise<any> | void;
    visitarExpressaoDefinirValor(expressao: DefinirValor): Promise<any> | void;
    visitarExpressaoFuncaoConstruto(expressao: FuncaoConstruto): Promise<any> | void;
    visitarExpressaoDeVariavel(expressao: Variavel | Constante): Promise<any> | void;
    visitarExpressaoDicionario(expressao: Dicionario): Promise<any> | void;
    visitarExpressaoExpressaoRegular(expressao: ExpressaoRegular): Promise<RegExp> | void;
    visitarExpressaoFalhar(expressao: Falhar): Promise<any> | void;
    visitarExpressaoFimPara(declaracao: FimPara): Promise<any> | void;
    visitarExpressaoFormatacaoEscrita(declaracao: FormatacaoEscrita): Promise<any> | void;
    visitarExpressaoIsto(expressao: Isto): Promise<any> | void;
    visitarExpressaoLeia(expressao: Leia): Promise<any> | void;
    visitarExpressaoLiteral(expressao: Literal): Promise<any> | void;
    visitarExpressaoLogica(expressao: Logico): Promise<any> | void;
    visitarExpressaoReferenciaFuncao(expressao: ReferenciaFuncao): Promise<any> | void;
    visitarExpressaoRetornar(expressao: Retorna): Promise<any> | void;
    visitarExpressaoSeparador(expressao: Separador): Promise<any> | void;
    visitarExpressaoSuper(expressao: Super): Promise<any> | void;
    visitarExpressaoSustar(declaracao?: Sustar): SustarQuebra | void;
    visitarExpressaoTupla(expressao: Tupla): Promise<any> | void;
    visitarExpressaoTuplaN(expressao: TuplaN): Promise<any> | void;
    visitarExpressaoTipoDe(expressao: TipoDe): Promise<any> | void;
    visitarExpressaoUnaria(expressao: Unario): Promise<any> | void;
    visitarExpressaoVetor(expressao: Vetor): Promise<any> | void;
}
