import {
    Atribuir,
    Binario,
    Chamada,
    Construto,
    ExpressaoRegular,
    FimPara,
    FormatacaoEscrita,
    Literal,
    Super,
    TipoDe,
    Tupla,
    Vetor,
} from '../../construtos';
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
    Falhar,
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
import { SimboloInterface } from '../../interfaces';
import { DiagnosticoAnalisadorSemantico, DiagnosticoSeveridade } from '../../interfaces/erros';
import { FuncaoHipoteticaInterface } from '../../interfaces/funcao-hipotetica-interface';
import { RetornoAnalisadorSemantico } from '../../interfaces/retornos/retorno-analisador-semantico';
import { VariavelHipoteticaInterface } from '../../interfaces/variavel-hipotetica-interface';
import { ContinuarQuebra, RetornoQuebra, SustarQuebra } from '../../quebras';
import { AnalisadorSemanticoBase } from '../analisador-semantico-base';
import { PilhaVariaveis } from './../pilha-variaveis';

export class AnalisadorSemanticoMapler extends AnalisadorSemanticoBase {
    pilhaVariaveis: PilhaVariaveis;
    variaveis: { [nomeVariavel: string]: VariavelHipoteticaInterface };
    funcoes: { [nomeFuncao: string]: FuncaoHipoteticaInterface };
    atual: number;
    diagnosticos: DiagnosticoAnalisadorSemantico[];

    constructor() {
        super();
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
            severidade: DiagnosticoSeveridade.ERRO,
        });
    }

    aviso(simbolo: SimboloInterface, mensagem: string): void {
        this.diagnosticos.push({
            simbolo: simbolo,
            mensagem: mensagem,
            hashArquivo: simbolo.hashArquivo,
            linha: simbolo.linha,
            severidade: DiagnosticoSeveridade.AVISO,
        });
    }

    visitarExpressaoDeAtribuicao(expressao: Atribuir) {
        let valor = this.variaveis[expressao.simbolo.lexema];
        if (!valor) {
            this.erro(
                expressao.simbolo,
                `Variável ${expressao.simbolo.lexema} ainda não foi declarada até este ponto.`
            );
            return Promise.resolve();
        }

        if (valor.tipo) {
            if (expressao.valor instanceof Literal && valor.tipo.includes('[]')) {
                this.erro(expressao.simbolo, `Atribuição inválida, esperado tipo '${valor.tipo}' na atribuição.`);
                return Promise.resolve();
            }

            if (expressao.valor instanceof Vetor && !valor.tipo.includes('[]')) {
                this.erro(expressao.simbolo, `Atribuição inválida, esperado tipo '${valor.tipo}' na atribuição.`);
                return Promise.resolve();
            }

            if (expressao.valor instanceof Literal) {
                let valorLiteral = typeof (expressao.valor as Literal).valor;
                if (!['qualquer'].includes(valor.tipo)) {
                    if (valorLiteral === 'string') {
                        if (valor.tipo != 'texto') {
                            this.erro(expressao.simbolo, `Esperado tipo '${valor.tipo}' na atribuição.`);
                            return Promise.resolve();
                        }
                    }
                    if (valorLiteral === 'number') {
                        if (!['inteiro', 'real'].includes(valor.tipo)) {
                            this.erro(expressao.simbolo, `Esperado tipo '${valor.tipo}' na atribuição.`);
                            return Promise.resolve();
                        }
                    }
                }
            }
        }

        if (this.variaveis[expressao.simbolo.lexema]) {
            this.variaveis[expressao.simbolo.lexema].valor = expressao.valor;
        }
    }

    visitarDeclaracaoDeExpressao(declaracao: Expressao) {
        return declaracao.expressao.aceitar(this);
    }

    visitarDeclaracaoVar(declaracao: Var): Promise<any> {
        this.variaveis[declaracao.simbolo.lexema] = {
            imutavel: false,
            tipo: declaracao.tipo,
            valor:
                declaracao.inicializador !== null
                    ? declaracao.inicializador.valor !== undefined
                        ? declaracao.inicializador.valor
                        : declaracao.inicializador
                    : undefined,
        };

        return Promise.resolve();
    }

    visitarExpressaoRetornar(declaracao: Retorna): Promise<RetornoQuebra> {
        return Promise.resolve(null);
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
