import {
    Atribuir,
    AcessoIndiceVariavel,
    AcessoElementoMatriz,
    AcessoMetodo,
    AcessoMetodoOuPropriedade,
    AcessoPropriedade,
    Agrupamento,
    AtribuicaoPorIndice,
    AtribuicaoPorIndicesMatriz,
    Binario,
    Chamada,
    DefinirValor,
    FuncaoConstruto,
    Variavel,
    Constante,
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
    ArgumentoReferenciaFuncao,
    ReferenciaFuncao,
    Leia,
    ComentarioComoConstruto,
    Separador,
} from '../construtos';
import {
    CabecalhoPrograma,
    Classe,
    Const,
    ConstMultiplo,
    Expressao,
    FuncaoDeclaracao,
    Enquanto,
    Escolha,
    Escreva,
    EscrevaMesmaLinha,
    Fazer,
    Importar,
    InicioAlgoritmo,
    Para,
    ParaCada,
    Se,
    TendoComo,
    Tente,
    Var,
    VarMultiplo,
    Bloco,
    Continua,
    Falhar,
    Retorna,
    Sustar,
    Comentario,
} from '../declaracoes';
import { VisitanteComumInterface } from '../interfaces';
import { ContinuarQuebra, RetornoQuebra, SustarQuebra } from '../quebras';

export class FormatadorPitugues implements VisitanteComumInterface {
    /* istanbul ignore next */
    visitarExpressaoSeparador(expressao: Separador): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoComentario(expressao: ComentarioComoConstruto): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoArgumentoReferenciaFuncao(
        expressao: ArgumentoReferenciaFuncao
    ): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoReferenciaFuncao(expressao: ReferenciaFuncao): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarDeclaracaoCabecalhoPrograma(declaracao: CabecalhoPrograma): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarDeclaracaoClasse(declaracao: Classe): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarDeclaracaoComentario(declaracao: Comentario): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarDeclaracaoConst(declaracao: Const): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarDeclaracaoConstMultiplo(declaracao: ConstMultiplo): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarDeclaracaoDeExpressao(declaracao: Expressao): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarDeclaracaoDefinicaoFuncao(declaracao: FuncaoDeclaracao): void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarDeclaracaoEnquanto(declaracao: Enquanto): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarDeclaracaoEscolha(declaracao: Escolha): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarDeclaracaoEscreva(declaracao: Escreva): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarDeclaracaoEscrevaMesmaLinha(declaracao: EscrevaMesmaLinha): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarDeclaracaoFazer(declaracao: Fazer): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarDeclaracaoImportar(declaracao: Importar): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarDeclaracaoInicioAlgoritmo(declaracao: InicioAlgoritmo): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarDeclaracaoPara(declaracao: Para): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarDeclaracaoParaCada(declaracao: ParaCada): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarDeclaracaoSe(declaracao: Se): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarDeclaracaoTendoComo(declaracao: TendoComo): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarDeclaracaoTente(declaracao: Tente): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarDeclaracaoVar(declaracao: Var): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarDeclaracaoVarMultiplo(declaracao: VarMultiplo): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoDeAtribuicao(expressao: Atribuir): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoAcessoIndiceVariavel(expressao: AcessoIndiceVariavel): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoAcessoElementoMatriz(expressao: AcessoElementoMatriz): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoAcessoMetodo(expressao: AcessoMetodo): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoAcessoMetodoOuPropriedade(
        expressao: AcessoMetodoOuPropriedade
    ): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoAcessoPropriedade(expressao: AcessoPropriedade): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoAgrupamento(expressao: Agrupamento): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoAtribuicaoPorIndice(expressao: AtribuicaoPorIndice): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoAtribuicaoPorIndicesMatriz(
        expressao: AtribuicaoPorIndicesMatriz
    ): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoBinaria(expressao: Binario): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoBloco(declaracao: Bloco): Promise<any> {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoContinua(declaracao?: Continua): ContinuarQuebra {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoDeChamada(expressao: Chamada): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoDefinirValor(expressao: DefinirValor): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoFuncaoConstruto(expressao: FuncaoConstruto): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoDeVariavel(expressao: Variavel | Constante): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoDicionario(expressao: Dicionario): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoExpressaoRegular(expressao: ExpressaoRegular): Promise<RegExp> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoFalhar(expressao: Falhar): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoFimPara(declaracao: FimPara): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoFormatacaoEscrita(declaracao: FormatacaoEscrita): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoIsto(expressao: Isto): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoLeia(expressao: Leia): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoLiteral(expressao: Literal): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoLogica(expressao: Logico): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoRetornar(declaracao: Retorna): Promise<RetornoQuebra> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoSuper(expressao: Super): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoSustar(declaracao?: Sustar): SustarQuebra | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoTupla(expressao: Tupla): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoTipoDe(expressao: TipoDe): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoUnaria(expressao: Unario): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoVetor(expressao: Vetor): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
}
