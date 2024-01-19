import { Atribuir, Chamada, ExpressaoRegular, FimPara, FormatacaoEscrita, Literal, Super, TipoDe, Variavel, Vetor } from "../../construtos";
import {
    Bloco,
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
    VarMultiplo
} from "../../declaracoes";
import { SimboloInterface } from "../../interfaces";
import { AnalisadorSemanticoInterface } from "../../interfaces/analisador-semantico-interface";
import { DiagnosticoAnalisadorSemantico, DiagnosticoSeveridade } from "../../interfaces/erros";
import { RetornoAnalisadorSemantico } from "../../interfaces/retornos/retorno-analisador-semantico";
import { TiposDadosInterface } from "../../interfaces/tipos-dados-interface";
import { ContinuarQuebra, RetornoQuebra, SustarQuebra } from "../../quebras";
import { PilhaVariaveis } from "../pilha-variaveis";

interface VariavelHipoteticaInterface {
    tipo: TiposDadosInterface;
    subtipo?: 'texto' | 'número' | 'inteiro' | 'longo' | 'lógico';
    imutavel: boolean;
    valor?: any
}

interface FuncaoHipoteticaInterface {
    valor: any
}

export class AnalisadorSemanticoVisualg implements AnalisadorSemanticoInterface {
    pilhaVariaveis: PilhaVariaveis;
    variaveis: { [nomeVariavel: string]: VariavelHipoteticaInterface };
    funcoes: { [nomeFuncao: string]: FuncaoHipoteticaInterface }
    atual: number;
    diagnosticos: DiagnosticoAnalisadorSemantico[];

    constructor() {
        this.pilhaVariaveis = new PilhaVariaveis();
        this.variaveis = {};
        this.funcoes = {};
        this.atual = 0;
        this.diagnosticos = [];
    }

    erro(simbolo: SimboloInterface, mensagem: string): void {
        this.diagnosticos.push({
            simbolo: simbolo,
            mensagem: mensagem,
            hashArquivo: simbolo.hashArquivo,
            linha: simbolo.linha,
            severidade: DiagnosticoSeveridade.ERRO
        });
    }

    aviso(simbolo: SimboloInterface, mensagem: string): void {
        this.diagnosticos.push({
            simbolo: simbolo,
            mensagem: mensagem,
            hashArquivo: simbolo.hashArquivo,
            linha: simbolo.linha,
            severidade: DiagnosticoSeveridade.AVISO
        });
    }

    visitarDeclaracaoDeAtribuicao(expressao: Atribuir) {
        return Promise.resolve();
    }

    visitarDeclaracaoVar(declaracao: Var): Promise<any> {
        this.variaveis[declaracao.simbolo.lexema] = {
            imutavel: false,
            tipo: declaracao.tipo,
            valor: declaracao.inicializador !== null ? declaracao.inicializador.valor !== undefined ? declaracao.inicializador.valor : declaracao.inicializador : undefined
        }
        console.log(declaracao.simbolo.lexema)
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

    visitarDeclaracaoDeExpressao(declaracao: Expressao) {
        return Promise.resolve();
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

    visitarDeclaracaoEscrevaMesmaLinha(declaracao: EscrevaMesmaLinha) {
        declaracao.argumentos.forEach((argumento: FormatacaoEscrita) => {
            if (argumento.expressao instanceof Variavel) {
                if (!this.variaveis[argumento.expressao.simbolo.lexema]) {
                    this.erro(argumento.expressao.simbolo, `Variável '${argumento.expressao.simbolo.lexema}' não existe.`)
                    return Promise.resolve();
                }
                if (this.variaveis[argumento.expressao.simbolo.lexema]?.valor === undefined) {
                    console.log("Acho que está passando aqui")
                    this.aviso(argumento.expressao.simbolo, `Variável '${argumento.expressao.simbolo.lexema}' não foi inicializada.`)
                    return Promise.resolve();
                }
            }
        })

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

    visitarDeclaracaoVarMultiplo(declaracao: VarMultiplo): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoAcessoIndiceVariavel(expressao: any) {
        return Promise.resolve();
    }

    visitarExpressaoVetor(expressao: any) {
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

    visitarExpressaoDeChamada(expressao: Chamada) {
        return Promise.resolve()
    }

    visitarExpressaoDeVariavel(expressao: any) {
        return Promise.resolve();
    }

    visitarExpressaoDefinirValor(expressao: any) {
        return Promise.resolve();
    }

    visitarExpressaoDeleguaFuncao(expressao: any) {
        return Promise.resolve();
    }

    visitarExpressaoDicionario(expressao: any) {
        return Promise.resolve();
    }

    visitarExpressaoExpressaoRegular(expressao: ExpressaoRegular): Promise<any> {
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

    visitarExpressaoLeia(expressao: Leia): Promise<any> {
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

    visitarExpressaoTipoDe(expressao: TipoDe): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoUnaria(expressao: any) {
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
            diagnosticos: this.diagnosticos
        } as RetornoAnalisadorSemantico
    }
}
