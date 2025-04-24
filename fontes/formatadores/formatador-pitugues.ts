import {
    Comentario,
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
} from '../construtos';
import {
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
    Leia,
    Retorna,
    Sustar,
} from '../declaracoes';
import { VisitanteComumInterface } from '../interfaces';
import { ContinuarQuebra, RetornoQuebra, SustarQuebra } from '../quebras';

export class FormatadorPitugues implements VisitanteComumInterface {
    visitarExpressaoArgumentoReferenciaFuncao(expressao: ArgumentoReferenciaFuncao): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoReferenciaFuncao(expressao: ReferenciaFuncao): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    visitarDeclaracaoAleatorio(declaracao: Aleatorio): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    visitarDeclaracaoCabecalhoPrograma(declaracao: CabecalhoPrograma): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    visitarDeclaracaoClasse(declaracao: Classe): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    visitarDeclaracaoComentario(declaracao: Comentario): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    visitarDeclaracaoConst(declaracao: Const): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    visitarDeclaracaoConstMultiplo(declaracao: ConstMultiplo): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    visitarDeclaracaoDeExpressao(declaracao: Expressao): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    visitarDeclaracaoDefinicaoFuncao(declaracao: FuncaoDeclaracao): void {
        throw new Error('Método não implementado.');
    }
    visitarDeclaracaoEnquanto(declaracao: Enquanto): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    visitarDeclaracaoEscolha(declaracao: Escolha): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    visitarDeclaracaoEscreva(declaracao: Escreva): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    visitarDeclaracaoEscrevaMesmaLinha(declaracao: EscrevaMesmaLinha): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    visitarDeclaracaoFazer(declaracao: Fazer): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    visitarDeclaracaoImportar(declaracao: Importar): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    visitarDeclaracaoInicioAlgoritmo(declaracao: InicioAlgoritmo): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    visitarDeclaracaoPara(declaracao: Para): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    visitarDeclaracaoParaCada(declaracao: ParaCada): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    visitarDeclaracaoSe(declaracao: Se): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    visitarDeclaracaoTendoComo(declaracao: TendoComo): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    visitarDeclaracaoTente(declaracao: Tente): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    visitarDeclaracaoVar(declaracao: Var): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    visitarDeclaracaoVarMultiplo(declaracao: VarMultiplo): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoDeAtribuicao(expressao: Atribuir): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoAcessoIndiceVariavel(expressao: AcessoIndiceVariavel): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoAcessoElementoMatriz(expressao: AcessoElementoMatriz): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoAcessoMetodo(expressao: AcessoMetodo): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoAcessoMetodoOuPropriedade(expressao: AcessoMetodoOuPropriedade): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoAcessoPropriedade(expressao: AcessoPropriedade): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoAgrupamento(expressao: Agrupamento): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoAtribuicaoPorIndice(expressao: AtribuicaoPorIndice): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoAtribuicaoPorIndicesMatriz(expressao: AtribuicaoPorIndicesMatriz): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoBinaria(expressao: Binario): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoBloco(declaracao: Bloco): Promise<any> {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoContinua(declaracao?: Continua): ContinuarQuebra {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoDeChamada(expressao: Chamada): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoDefinirValor(expressao: DefinirValor): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoFuncaoConstruto(expressao: FuncaoConstruto): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoDeVariavel(expressao: Variavel | Constante): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoDicionario(expressao: Dicionario): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoExpressaoRegular(expressao: ExpressaoRegular): Promise<RegExp> | void {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoFalhar(expressao: Falhar): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoFimPara(declaracao: FimPara): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoFormatacaoEscrita(declaracao: FormatacaoEscrita): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoIsto(expressao: Isto): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoLeia(expressao: Leia): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    visitarExpressaoLiteral(expressao: Literal): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoLogica(expressao: Logico): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoRetornar(declaracao: Retorna): Promise<RetornoQuebra> | void {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoSuper(expressao: Super): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoSustar(declaracao?: Sustar): SustarQuebra | void {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoTupla(expressao: Tupla): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoTipoDe(expressao: TipoDe): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoUnaria(expressao: Unario): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoVetor(expressao: Vetor): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
}
