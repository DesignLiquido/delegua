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
    DefinirValor,
    Dicionario,
    ExpressaoRegular,
    FimPara,
    FuncaoConstruto,
    Isto,
    Literal,
    Logico,
    Super,
    TipoDe,
    Tupla,
    Unario,
    Vetor,
} from '../construtos';
import {
    Aleatorio,
    Bloco,
    CabecalhoPrograma,
    Classe,
    Const,
    Continua,
    Declaracao,
    Enquanto,
    Escolha,
    Escreva,
    Expressao,
    Falhar,
    Fazer,
    FuncaoDeclaracao,
    Importar,
    Leia,
    Para,
    ParaCada,
    Retorna,
    Se,
    Sustar,
    Tente,
    Var,
} from '../declaracoes';
import { ContinuarQuebra, RetornoQuebra, SustarQuebra } from '../quebras';

import { EscrevaMesmaLinha } from '../declaracoes/escreva-mesma-linha';
import { FormatacaoEscrita } from '../construtos/formatacao-escrita';
import { LeiaMultiplo } from '../declaracoes/leia-multiplo';
import { ConstMultiplo } from '../declaracoes/const-multiplo';
import { VarMultiplo } from '../declaracoes/var-multiplo';
import { InicioAlgoritmo } from '../declaracoes/inicio-algoritmo';
import { TendoComo } from '../declaracoes/tendo-como';
import { DeleguaFuncao } from '../estruturas';

export interface VisitanteComumInterface {
    visitarDeclaracaoTendoComo(declaracao: TendoComo): Promise<any>;
    visitarDeclaracaoInicioAlgoritmo(declaracao: InicioAlgoritmo): Promise<any>;
    visitarDeclaracaoAleatorio(declaracao: Aleatorio): Promise<any>;
    visitarDeclaracaoCabecalhoPrograma(declaracao: CabecalhoPrograma): Promise<any>;
    visitarDeclaracaoClasse(declaracao: Classe): Promise<any>;
    visitarDeclaracaoConst(declaracao: Const): Promise<any>;
    visitarDeclaracaoConstMultiplo(declaracao: ConstMultiplo): Promise<any>;
    visitarExpressaoDeAtribuicao(expressao: Atribuir): Promise<any>;
    visitarDeclaracaoDeExpressao(declaracao: Expressao): Promise<any>;
    visitarDeclaracaoDefinicaoFuncao(declaracao: FuncaoDeclaracao): void;
    visitarDeclaracaoEnquanto(declaracao: Enquanto): Promise<any>;
    visitarDeclaracaoEscolha(declaracao: Escolha): Promise<any>;
    visitarDeclaracaoEscreva(declaracao: Escreva): Promise<any>;
    visitarDeclaracaoFazer(declaracao: Fazer): Promise<any>;
    visitarDeclaracaoImportar(declaracao: Importar): Promise<any>;
    visitarDeclaracaoPara(declaracao: Para): Promise<any>;
    visitarDeclaracaoParaCada(declaracao: ParaCada): Promise<any>;
    visitarDeclaracaoSe(declaracao: Se): Promise<any>;
    visitarDeclaracaoTente(declaracao: Tente): Promise<any>;
    visitarDeclaracaoVar(declaracao: Var): Promise<any>;
    visitarDeclaracaoVarMultiplo(declaracao: VarMultiplo): Promise<any>;
    visitarExpressaoAcessoIndiceVariavel(expressao: AcessoIndiceVariavel): Promise<any>;
    visitarExpressaoAcessoElementoMatriz(expressao: AcessoElementoMatriz): Promise<any>;
    visitarExpressaoAcessoMetodo(expressao: AcessoMetodoOuPropriedade): Promise<any>;
    visitarExpressaoAgrupamento(expressao: Agrupamento): Promise<any>;
    visitarExpressaoAtribuicaoPorIndice(expressao: AtribuicaoPorIndice): Promise<any>;
    visitarExpressaoAtribuicaoPorIndicesMatriz(expressao: AtribuicaoPorIndicesMatriz): Promise<any>;
    visitarExpressaoBinaria(expressao: Binario): Promise<any>;
    visitarExpressaoBloco(declaracao: Bloco): Promise<any>;
    visitarExpressaoContinua(declaracao?: Continua): ContinuarQuebra;
    visitarExpressaoDeChamada(expressao: Chamada): Promise<any>;
    visitarExpressaoDefinirValor(expressao: DefinirValor): Promise<any>;
    visitarExpressaoDeleguaFuncao(expressao: FuncaoConstruto): Promise<any>;
    visitarExpressaoDeVariavel(expressao: Var): Promise<any>;
    visitarExpressaoDicionario(expressao: Dicionario): Promise<any>;
    visitarExpressaoExpressaoRegular(expressao: ExpressaoRegular): Promise<RegExp>;
    visitarDeclaracaoEscrevaMesmaLinha(declaracao: EscrevaMesmaLinha): Promise<any>;
    visitarExpressaoFalhar(expressao: Falhar): Promise<any>;
    visitarExpressaoFimPara(declaracao: FimPara): Promise<any>;
    visitarExpressaoFormatacaoEscrita(declaracao: FormatacaoEscrita): Promise<any>;
    visitarExpressaoIsto(expressao: Isto): Promise<any>;
    visitarExpressaoLeia(expressao: Leia): Promise<any>;
    visitarExpressaoLeiaMultiplo(expressao: LeiaMultiplo): Promise<any>;
    visitarExpressaoLiteral(expressao: Literal): Promise<any>;
    visitarExpressaoLogica(expressao: Logico): Promise<any>;
    visitarExpressaoRetornar(declaracao: Retorna): Promise<RetornoQuebra>;
    visitarExpressaoSuper(expressao: Super): Promise<any>;
    visitarExpressaoSustar(declaracao?: Sustar): SustarQuebra;
    visitarExpressaoTupla(expressao: Tupla): Promise<any>;
    visitarExpressaoTipoDe(expressao: TipoDe): Promise<any>;
    visitarExpressaoUnaria(expressao: Unario): Promise<any>;
    visitarExpressaoVetor(expressao: Vetor): Promise<any>;
}
