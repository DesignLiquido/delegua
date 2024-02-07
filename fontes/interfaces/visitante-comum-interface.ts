import { AcessoMetodoOuPropriedade, Atribuir, ExpressaoRegular, FimPara, Literal, Super, TipoDe, Tupla } from '../construtos';
import {
    Aleatorio,
    Bloco,
    CabecalhoPrograma,
    Classe,
    Const,
    Continua,
    Enquanto,
    Escolha,
    Escreva,
    Expressao,
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

export interface VisitanteComumInterface {
    visitarDeclaracaoInicioAlgoritmo(declaracao: InicioAlgoritmo): Promise<any>;
    visitarDeclaracaoAleatorio(declaracao: Aleatorio): Promise<any>;
    visitarDeclaracaoCabecalhoPrograma(declaracao: CabecalhoPrograma): Promise<any>;
    visitarDeclaracaoClasse(declaracao: Classe): any;
    visitarDeclaracaoConst(declaracao: Const): Promise<any>;
    visitarDeclaracaoConstMultiplo(declaracao: ConstMultiplo): Promise<any>;
    visitarExpressaoDeAtribuicao(expressao: Atribuir): any;
    visitarDeclaracaoDeExpressao(declaracao: Expressao): any;
    visitarDeclaracaoDefinicaoFuncao(declaracao: FuncaoDeclaracao): any;
    visitarDeclaracaoEnquanto(declaracao: Enquanto): any;
    visitarDeclaracaoEscolha(declaracao: Escolha): any;
    visitarDeclaracaoEscreva(declaracao: Escreva): any;
    visitarDeclaracaoFazer(declaracao: Fazer): any;
    visitarDeclaracaoImportar(declaracao: Importar): any;
    visitarDeclaracaoPara(declaracao: Para): Promise<any>;
    visitarDeclaracaoParaCada(declaracao: ParaCada): Promise<any>;
    visitarDeclaracaoSe(declaracao: Se): any;
    visitarDeclaracaoTente(declaracao: Tente): any;
    visitarDeclaracaoVar(declaracao: Var): Promise<any>;
    visitarDeclaracaoVarMultiplo(declaracao: VarMultiplo): Promise<any>;
    visitarExpressaoAcessoIndiceVariavel(expressao: any): any;
    visitarExpressaoAcessoElementoMatriz(expressao: any): any;
    visitarExpressaoAcessoMetodo(expressao: AcessoMetodoOuPropriedade): any;
    visitarExpressaoAgrupamento(expressao: any): Promise<any>;
    visitarExpressaoAtribuicaoPorIndice(expressao: any): Promise<any>;
    visitarExpressaoAtribuicaoPorIndicesMatriz(expressao: any): Promise<any>;
    visitarExpressaoBinaria(expressao: any): any;
    visitarExpressaoBloco(declaracao: Bloco): Promise<any>;
    visitarExpressaoContinua(declaracao?: Continua): ContinuarQuebra;
    visitarExpressaoDeChamada(expressao: any): any;
    visitarExpressaoDefinirValor(expressao: any): any;
    visitarExpressaoDeleguaFuncao(expressao: any): any;
    visitarExpressaoDeVariavel(expressao: any): any;
    visitarExpressaoDicionario(expressao: any): any;
    visitarExpressaoExpressaoRegular(expressao: ExpressaoRegular): Promise<RegExp>;
    visitarDeclaracaoEscrevaMesmaLinha(declaracao: EscrevaMesmaLinha): any;
    visitarExpressaoFalhar(expressao: any): Promise<any>;
    visitarExpressaoFimPara(declaracao: FimPara): any;
    visitarExpressaoFormatacaoEscrita(declaracao: FormatacaoEscrita): any;
    visitarExpressaoIsto(expressao: any): any;
    visitarExpressaoLeia(expressao: Leia): Promise<any>;
    visitarExpressaoLeiaMultiplo(expressao: LeiaMultiplo): Promise<any>;
    visitarExpressaoLiteral(expressao: Literal): Promise<any>;
    visitarExpressaoLogica(expressao: any): any;
    visitarExpressaoRetornar(declaracao: Retorna): Promise<RetornoQuebra>;
    visitarExpressaoSuper(expressao: Super): any;
    visitarExpressaoSustar(declaracao?: Sustar): SustarQuebra;
    visitarExpressaoTupla(expressao: Tupla): Promise<any>;
    visitarExpressaoTipoDe(expressao: TipoDe): Promise<any>;
    visitarExpressaoUnaria(expressao: any): any;
    visitarExpressaoVetor(expressao: any): any;
}
