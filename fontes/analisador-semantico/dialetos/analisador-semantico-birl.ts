import { Atribuir, ExpressaoRegular, FimPara, FormatacaoEscrita, Literal, Super, TipoDe, Tupla, Variavel } from '../../construtos';
import {
    Aleatorio,
    Bloco,
    CabecalhoPrograma,
    Classe,
    Const,
    ConstMultiplo,
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
    LeiaMultiplo,
    Para,
    ParaCada,
    Retorna,
    Se,
    Sustar,
    Tente,
    Var,
    VarMultiplo,
} from '../../declaracoes';
import { InicioAlgoritmo } from '../../declaracoes/inicio-algoritmo';
import { AnalisadorSemanticoInterface } from '../../interfaces/analisador-semantico-interface';
import { DiagnosticoAnalisadorSemantico, DiagnosticoSeveridade } from '../../interfaces/erros';
import { RetornoAnalisadorSemantico } from '../../interfaces/retornos/retorno-analisador-semantico';
import { ContinuarQuebra, RetornoQuebra, SustarQuebra } from '../../quebras';
import { PilhaVariaveis } from '../pilha-variaveis';

interface VariavelHipoteticaBirlInterface {
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

export class AnalisadorSemanticoBirl implements AnalisadorSemanticoInterface {
    pilhaVariaveis: PilhaVariaveis;
    variaveis: { [nomeVariavel: string]: VariavelHipoteticaBirlInterface };
    atual: number;
    diagnosticos: DiagnosticoAnalisadorSemantico[];

    constructor() {
        this.pilhaVariaveis = new PilhaVariaveis();
        this.variaveis = {};
        this.atual = 0;
        this.diagnosticos = [];
    }

    visitarDeclaracaoInicioAlgoritmo(declaracao: InicioAlgoritmo): Promise<any> {
        return Promise.resolve();
    }
    
    visitarDeclaracaoCabecalhoPrograma(declaracao: CabecalhoPrograma): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoTupla(expressao: Tupla): Promise<any> {
        return Promise.resolve();
    }
    visitarExpressaoAcessoElementoMatriz(expressao: any) {
        return Promise.resolve();
    }
    visitarExpressaoAtribuicaoPorIndicesMatriz(expressao: any): Promise<any> {
        return Promise.resolve();
    }
    visitarExpressaoExpressaoRegular(expressao: ExpressaoRegular): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoTipoDe(expressao: TipoDe): Promise<any> {
        return Promise.resolve();
    }

    visitarDeclaracaoClasse(declaracao: Classe) {
        return Promise.resolve();
    }

    visitarDeclaracaoConst(declaracao: Const): Promise<any> {
        return Promise.resolve();
    }

    visitarDeclaracaoConstMultiplo(declaracao: ConstMultiplo): Promise<any> {
        return Promise.resolve();
    }

    visitarDeclaracaoAleatorio(declaracao: Aleatorio): Promise<any>{
        return Promise.resolve();
    }

    visitarExpressaoDeAtribuicao(expressao: Atribuir) {
        if (!this.variaveis.hasOwnProperty(expressao.simbolo.lexema)) {
            this.diagnosticos.push({
                simbolo: expressao.simbolo,
                mensagem: `A variável ${expressao.simbolo.lexema} não foi declarada.`,
                hashArquivo: expressao.hashArquivo,
                linha: expressao.linha,
                severidade: DiagnosticoSeveridade.ERRO,
            });
            return Promise.resolve();
        }

        if (this.variaveis[expressao.simbolo.lexema].imutavel) {
            this.diagnosticos.push({
                simbolo: expressao.simbolo,
                mensagem: `Constante ${expressao.simbolo.lexema} não pode ser modificada.`,
                hashArquivo: expressao.hashArquivo,
                linha: expressao.linha,
                severidade: DiagnosticoSeveridade.ERRO,
            });
            return Promise.resolve();
        }
    }

    visitarDeclaracaoDeExpressao(declaracao: Expressao) {
        return declaracao.expressao.aceitar(this);
    }

    visitarDeclaracaoDefinicaoFuncao(declaracao: FuncaoDeclaracao) {
        return Promise.resolve();
    }

    visitarDeclaracaoEnquanto(declaracao: Enquanto) {
        return Promise.resolve();
    }

    visitarDeclaracaoEscolha(declaracao: Escolha) {
        return Promise.resolve();
    }

    visitarDeclaracaoEscreva(declaracao: Escreva) {
        return Promise.resolve();
    }

    visitarDeclaracaoFazer(declaracao: Fazer) {
        return Promise.resolve();
    }

    visitarDeclaracaoImportar(declaracao: Importar) {
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

    visitarDeclaracaoTente(declaracao: Tente) {
        return Promise.resolve();
    }

    visitarDeclaracaoVar(declaracao: Var): Promise<any> {
        this.variaveis[declaracao.simbolo.lexema] = {
            imutavel: false,
            tipo: 'número',
        };

        return Promise.resolve();
    }

    visitarDeclaracaoVarMultiplo(declaracao: VarMultiplo): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoAcessoIndiceVariavel(expressao: any) {
        return Promise.resolve();
    }

    visitarExpressaoAcessoMetodo(expressao: any) {
        return Promise.resolve();
    }

    visitarExpressaoAgrupamento(expressao: any): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoAtribuicaoPorIndice(expressao: any): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoBinaria(expressao: any) {
        return Promise.resolve();
    }

    visitarExpressaoBloco(declaracao: Bloco): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoContinua(declaracao?: Continua): ContinuarQuebra {
        return Promise.resolve();
    }

    visitarExpressaoDeChamada(expressao: any) {
        return Promise.resolve();
    }

    visitarExpressaoDefinirValor(expressao: any) {
        return Promise.resolve();
    }

    visitarExpressaoDeleguaFuncao(expressao: any) {
        return Promise.resolve();
    }

    visitarExpressaoDeVariavel(expressao: any) {
        return Promise.resolve();
    }

    visitarExpressaoDicionario(expressao: any) {
        return Promise.resolve();
    }

    visitarDeclaracaoEscrevaMesmaLinha(declaracao: EscrevaMesmaLinha) {
        return Promise.resolve();
    }

    visitarExpressaoFalhar(expressao: any): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoFimPara(declaracao: FimPara) {
        return Promise.resolve();
    }

    visitarExpressaoFormatacaoEscrita(declaracao: FormatacaoEscrita) {
        return Promise.resolve();
    }

    visitarExpressaoIsto(expressao: any) {
        return Promise.resolve();
    }

    visitarExpressaoLeia(expressao: Leia) {
        if (!this.variaveis.hasOwnProperty((expressao.argumentos[0] as Variavel).simbolo.lexema)) {
            this.diagnosticos.push({
                simbolo: (expressao.argumentos[0] as Variavel).simbolo,
                mensagem: `A variável ${(expressao.argumentos[0] as Variavel).simbolo.lexema} não foi declarada.`,
                hashArquivo: expressao.hashArquivo,
                linha: expressao.linha,
                severidade: DiagnosticoSeveridade.ERRO,
            });
            return Promise.resolve();
        }

        const tipoVariavelExpressão = this.variaveis[(expressao.argumentos[0] as Variavel).simbolo.lexema].tipo;
        const tipoVariavelArgumento = expressao.argumentos[1].valor;

        if (tipoVariavelExpressão !== tipoVariavelArgumento) {
            this.diagnosticos.push({
                simbolo: (expressao.argumentos[0] as Variavel).simbolo,
                mensagem: `A variável ${
                    (expressao.argumentos[0] as Variavel).simbolo.lexema
                } não é do tipo ${tipoVariavelArgumento}.`,
                hashArquivo: expressao.hashArquivo,
                linha: expressao.linha,
                severidade: DiagnosticoSeveridade.ERRO,
            });
            return Promise.resolve();
        }

        return Promise.resolve();
    }

    visitarExpressaoLeiaMultiplo(expressao: LeiaMultiplo): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoLiteral(expressao: Literal): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoLogica(expressao: any) {
        return Promise.resolve();
    }

    visitarExpressaoRetornar(declaracao: Retorna): Promise<RetornoQuebra> {
        return Promise.resolve(null);
    }

    visitarExpressaoSuper(expressao: Super) {
        return Promise.resolve();
    }

    visitarExpressaoSustar(declaracao?: Sustar): SustarQuebra {
        return Promise.resolve();
    }

    visitarExpressaoUnaria(expressao: any) {
        return Promise.resolve();
    }

    visitarExpressaoVetor(expressao: any) {
        return Promise.resolve();
    }

    analisar(declaracoes: Declaracao[]): RetornoAnalisadorSemantico {
        this.variaveis = {};
        this.atual = 0;
        this.diagnosticos = [];

        while (this.atual < declaracoes.length) {
            declaracoes[this.atual].aceitar(this);
            this.atual++;
        }

        return {
            diagnosticos: this.diagnosticos,
        } as RetornoAnalisadorSemantico;
    }
}
