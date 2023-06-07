import { Atribuir, FimPara, FormatacaoEscrita, Literal, Super, TipoDe } from '../construtos';
import {
    Bloco,
    Classe,
    Const,
    Continua,
    Declaracao,
    Enquanto,
    Escolha,
    Escreva,
    EscrevaMesmaLinha,
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
import { AnalisadorSemanticoInterface } from '../interfaces/analisador-semantico-interface';
import { ErroAnalisadorSemantico } from '../interfaces/erros';
import { RetornoAnalisadorSemantico } from '../interfaces/retornos/retorno-analisador-semantico';
import { ContinuarQuebra, RetornoQuebra, SustarQuebra } from '../quebras';
import { PilhaVariaveis } from './pilha-variaveis';

interface VariavelHipoteticaInterface {
    tipo:
        | 'texto'
        | 'número'
        | 'longo'
        | 'vetor'
        | 'dicionário'
        | 'nulo'
        | 'lógico'
        | 'função'
        | 'símbolo'
        | 'objeto'
        | 'módulo';
    subtipo?: 'texto' | 'número' | 'longo' | 'lógico';
    imutavel: boolean;
}

export class AnalisadorSemantico implements AnalisadorSemanticoInterface {
    pilhaVariaveis: PilhaVariaveis;
    variaveis: { [nomeVariavel: string]: VariavelHipoteticaInterface };
    atual: number;
    erros: ErroAnalisadorSemantico[];

    constructor() {
        this.pilhaVariaveis = new PilhaVariaveis();
        this.variaveis = {};
        this.atual = 0;
        this.erros = [];
    }

    visitarExpressaoTipoDe(expressao: TipoDe): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoFalhar(expressao: any): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoLiteral(expressao: Literal): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoAgrupamento(expressao: any): Promise<any> {
        return Promise.resolve();
    }
    visitarExpressaoUnaria(expressao: any) {
        return Promise.resolve();
    }
    visitarExpressaoBinaria(expressao: any) {
        return Promise.resolve();
    }
    visitarExpressaoDeChamada(expressao: any) {
        return Promise.resolve();
    }

    visitarDeclaracaoDeAtribuicao(expressao: Atribuir) {
        if (!this.variaveis.hasOwnProperty(expressao.simbolo.lexema)) {
            this.erros.push({
                simbolo: expressao.simbolo,
                mensagem: `Variável ${expressao.simbolo.lexema} ainda não foi declarada até este ponto.`,
                hashArquivo: expressao.hashArquivo,
                linha: expressao.linha,
            });

            return Promise.resolve();
        }

        if (this.variaveis[expressao.simbolo.lexema].imutavel) {
            this.erros.push({
                simbolo: expressao.simbolo,
                mensagem: `Constante ${expressao.simbolo.lexema} não pode ser modificada.`,
                hashArquivo: expressao.hashArquivo,
                linha: expressao.linha,
            });

            return Promise.resolve();
        }
    }

    visitarExpressaoDeVariavel(expressao: any) {
        return Promise.resolve();
    }

    visitarDeclaracaoDeExpressao(declaracao: Expressao) {
        return declaracao.expressao.aceitar(this);
    }

    visitarExpressaoLeia(expressao: Leia) {
        return Promise.resolve();
    }
    visitarExpressaoLogica(expressao: any) {
        return Promise.resolve();
    }
    visitarDeclaracaoPara(declaracao: Para): Promise<any> {
        return Promise.resolve();
    }
    visitarDeclaracaoParaCada(declaracao: ParaCada): Promise<any> {
        return Promise.resolve();
    }
    visitarDeclaracaoSe(declaracao: Se) {
        return Promise.resolve();
    }
    visitarExpressaoFimPara(declaracao: FimPara) {
        return Promise.resolve();
    }
    visitarDeclaracaoFazer(declaracao: Fazer) {
        return Promise.resolve();
    }
    visitarExpressaoFormatacaoEscrita(declaracao: FormatacaoEscrita) {
        return Promise.resolve();
    }
    visitarDeclaracaoEscolha(declaracao: Escolha) {
        return Promise.resolve();
    }
    visitarDeclaracaoTente(declaracao: Tente) {
        return Promise.resolve();
    }
    visitarDeclaracaoEnquanto(declaracao: Enquanto) {
        return Promise.resolve();
    }
    visitarDeclaracaoImportar(declaracao: Importar) {
        return Promise.resolve();
    }

    visitarDeclaracaoEscreva(declaracao: Escreva) {
        // return Promise.resolve();
    }

    visitarExpressaoEscrevaMesmaLinha(declaracao: EscrevaMesmaLinha) {
        return Promise.resolve();
    }

    visitarExpressaoBloco(declaracao: Bloco): Promise<any> {
        return Promise.resolve();
    }

    visitarDeclaracaoVar(declaracao: Var): Promise<any> {
        this.variaveis[declaracao.simbolo.lexema] = {
            imutavel: false,
            tipo: 'número',
        };

        return Promise.resolve();
    }

    visitarDeclaracaoConst(declaracao: Const): Promise<any> {
        if (this.variaveis.hasOwnProperty(declaracao.simbolo.lexema)) {
            this.erros.push({
                simbolo: declaracao.simbolo,
                mensagem: 'Declaração de constante já feita.',
                hashArquivo: declaracao.hashArquivo,
                linha: declaracao.linha,
            });
        } else {
            this.variaveis[declaracao.simbolo.lexema] = {
                imutavel: true,
                tipo: 'número',
            };
        }

        return Promise.resolve();
    }

    visitarExpressaoContinua(declaracao?: Continua): ContinuarQuebra {
        return Promise.resolve();
    }
    visitarExpressaoSustar(declaracao?: Sustar): SustarQuebra {
        return Promise.resolve();
    }
    visitarExpressaoRetornar(declaracao: Retorna): Promise<RetornoQuebra> {
        return Promise.resolve(null);
    }
    visitarExpressaoDeleguaFuncao(expressao: any) {
        return Promise.resolve();
    }
    visitarExpressaoAtribuicaoPorIndice(expressao: any): Promise<any> {
        return Promise.resolve();
    }
    visitarExpressaoAcessoIndiceVariavel(expressao: any) {
        return Promise.resolve();
    }
    visitarExpressaoDefinirValor(expressao: any) {
        return Promise.resolve();
    }
    visitarDeclaracaoDefinicaoFuncao(declaracao: FuncaoDeclaracao) {
        return Promise.resolve();
    }
    visitarDeclaracaoClasse(declaracao: Classe) {
        return Promise.resolve();
    }
    visitarExpressaoAcessoMetodo(expressao: any) {
        return Promise.resolve();
    }
    visitarExpressaoIsto(expressao: any) {
        return Promise.resolve();
    }
    visitarExpressaoDicionario(expressao: any) {
        return Promise.resolve();
    }
    visitarExpressaoVetor(expressao: any) {
        return Promise.resolve();
    }
    visitarExpressaoSuper(expressao: Super) {
        return Promise.resolve();
    }

    analisar(declaracoes: Declaracao[]): RetornoAnalisadorSemantico {
        // this.pilhaVariaveis = new PilhaVariaveis();
        // this.pilhaVariaveis.empilhar()
        this.variaveis = {};
        this.atual = 0;
        this.erros = [];

        while (this.atual < declaracoes.length) {
            declaracoes[this.atual].aceitar(this);
            this.atual++;
        }

        return {
            erros: this.erros,
        } as RetornoAnalisadorSemantico;
    }
}
