import { ErroResolvedor } from '../interpretador/dialetos/egua-classico/resolvedor/erro-resolvedor';
import { PilhaEscopos } from '../interpretador/dialetos/egua-classico/resolvedor/pilha-escopos';
import { ConstrutoInterface } from './construtos';
import { RetornoResolvedor } from './egua-classico/retorno-resolvedor-interface';
import { SimboloInterface } from './simbolo-interface';

// TODO: Estender com `VisitanteComumInterface`?
export interface ResolvedorInterface {
    erros: ErroResolvedor[];
    escopos: PilhaEscopos;
    locais: Map<ConstrutoInterface, number>;
    funcaoAtual: any;
    classeAtual: any;
    cicloAtual: any;

    definir(simbolo: SimboloInterface): void;
    declarar(simbolo: SimboloInterface): void;
    inicioDoEscopo(): void;
    finalDoEscopo(): void;
    resolver(declaracoes: any): Promise<RetornoResolvedor>;
    resolverLocal(expressao: any, nome: any): void;
    visitarExpressaoBloco(declaracao: any): any;
    visitarExpressaoDeVariavel(expressao: any): any;
    resolverFuncao(funcao: any, funcType: any): void;
    visitarExpressaoDeleguaFuncao(declaracao: any): any;
    visitarExpressaoSuper(expressao: any): any;
    visitarExpressaoAcessoMetodo(expressao: any): any;
    visitarDeclaracaoDeExpressao(declaracao: any): any;
    visitarExpressaoRetornar(declaracao: any): any;
    visitarExpressaoBinaria(expressao: any): any;
    visitarExpressaoDeChamada(expressao: any): any;
    visitarExpressaoAgrupamento(expressao: any): any;
    visitarExpressaoDicionario(expressao: any): any;
    visitarExpressaoVetor(expressao: any): any;
    visitarExpressaoAcessoIndiceVariavel(expressao: any): any;
    visitarExpressaoContinua(declaracao?: any): any;
    visitarExpressaoSustar(declaracao?: any): any;
    visitarExpressaoAtribuicaoPorIndice(expressao?: any): any;
    visitarExpressaoLiteral(expressao?: any): any;
    visitarExpressaoLogica(expressao?: any): any;
    visitarExpressaoUnaria(expressao?: any): any;
    visitarExpressaoDefinirValor(expressao?: any): any;
    visitarExpressaoIsto(expressao?: any): any;
}
