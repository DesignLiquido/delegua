import { Atribuir, FimPara, Literal, Super, TipoDe } from '../construtos';
import {
    Bloco,
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

export interface VisitanteComumInterface {
    visitarDeclaracaoClasse(declaracao: Classe): any;
    visitarDeclaracaoConst(declaracao: Const): Promise<any>;
    visitarDeclaracaoDeAtribuicao(expressao: Atribuir): any;
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
    visitarExpressaoAcessoIndiceVariavel(expressao: any): any;
    visitarExpressaoAcessoMetodo(expressao: any): any;
    visitarExpressaoAgrupamento(expressao: any): Promise<any>;
    visitarExpressaoAtribuicaoPorIndice(expressao: any): Promise<any>;
    visitarExpressaoBinaria(expressao: any): any;
    visitarExpressaoBloco(declaracao: Bloco): Promise<any>;
    visitarExpressaoContinua(declaracao?: Continua): ContinuarQuebra;
    visitarExpressaoDeChamada(expressao: any): any;
    visitarExpressaoDefinirValor(expressao: any): any;
    visitarExpressaoDeleguaFuncao(expressao: any): any;
    visitarExpressaoDeVariavel(expressao: any): any;
    visitarExpressaoDicionario(expressao: any): any;
    visitarExpressaoEscrevaMesmaLinha(declaracao: EscrevaMesmaLinha): any;
    visitarExpressaoFalhar(expressao: any): Promise<any>;
    visitarExpressaoFimPara(declaracao: FimPara): any;
    visitarExpressaoFormatacaoEscrita(declaracao: FormatacaoEscrita): any;
    visitarExpressaoIsto(expressao: any): any;
    visitarExpressaoLeia(expressao: Leia): any;
    visitarExpressaoLiteral(expressao: Literal): Promise<any>;
    visitarExpressaoLogica(expressao: any): any;
    visitarExpressaoRetornar(declaracao: Retorna): Promise<RetornoQuebra>;
    visitarExpressaoSuper(expressao: Super): any;
    visitarExpressaoSustar(declaracao?: Sustar): SustarQuebra;
    visitarExpressaoTipoDe(expressao: TipoDe): Promise<any>;
    visitarExpressaoUnaria(expressao: any): any;
    visitarExpressaoVetor(expressao: any): any;
}
