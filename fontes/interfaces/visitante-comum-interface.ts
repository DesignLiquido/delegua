import { EspacoVariaveis } from '../espaco-variaveis';
import { Atribuir, Construto, FimPara, Literal, Super } from '../construtos';
import {
    Bloco,
    Classe,
    Const,
    Continua,
    Declaracao,
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
    visitarExpressaoAgrupamento(expressao: any): Promise<any>;
    visitarExpressaoUnaria(expressao: any): any;
    visitarExpressaoBinaria(expressao: any): any;
    visitarExpressaoDeChamada(expressao: any): any;
    visitarDeclaracaoDeAtribuicao(expressao: Atribuir): any;
    visitarExpressaoDeVariavel(expressao: any): any;
    visitarDeclaracaoDeExpressao(declaracao: Expressao): any;
    visitarExpressaoLeia(expressao: Leia): any;
    visitarExpressaoLiteral(expressao: Literal): Promise<any>;
    visitarExpressaoLogica(expressao: any): any;
    visitarDeclaracaoPara(declaracao: Para): Promise<any>;
    visitarDeclaracaoParaCada(declaracao: ParaCada): Promise<any>;
    visitarDeclaracaoSe(declaracao: Se): any;
    visitarExpressaoFimPara(declaracao: FimPara): any;
    visitarDeclaracaoFazer(declaracao: Fazer): any;
    visitarExpressaoFormatacaoEscrita(declaracao: FormatacaoEscrita): any;
    visitarDeclaracaoEscolha(declaracao: Escolha): any;
    visitarDeclaracaoTente(declaracao: Tente): any;
    visitarDeclaracaoEnquanto(declaracao: Enquanto): any;
    visitarDeclaracaoImportar(declaracao: Importar): any;
    visitarDeclaracaoEscreva(declaracao: Escreva): any;
    visitarExpressaoEscrevaMesmaLinha(declaracao: EscrevaMesmaLinha): any;
    visitarExpressaoBloco(declaracao: Bloco): Promise<any>;
    visitarDeclaracaoVar(declaracao: Var): Promise<any>;
    visitarDeclaracaoConst(declaracao: Const): Promise<any>;
    visitarExpressaoContinua(declaracao?: Continua): ContinuarQuebra;
    visitarExpressaoSustar(declaracao?: Sustar): SustarQuebra;
    visitarExpressaoRetornar(declaracao: Retorna): Promise<RetornoQuebra>;
    visitarExpressaoDeleguaFuncao(expressao: any): any;
    visitarExpressaoAtribuicaoSobrescrita(expressao: any): Promise<any>;
    visitarExpressaoAcessoIndiceVariavel(expressao: any): any;
    visitarExpressaoDefinirValor(expressao: any): any;
    visitarDeclaracaoDefinicaoFuncao(declaracao: FuncaoDeclaracao): any;
    visitarDeclaracaoClasse(declaracao: Classe): any;
    visitarExpressaoAcessoMetodo(expressao: any): any;
    visitarExpressaoIsto(expressao: any): any;
    visitarExpressaoDicionario(expressao: any): any;
    visitarExpressaoVetor(expressao: any): any;
    visitarExpressaoSuper(expressao: Super): any;
}