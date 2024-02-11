import {
    Atribuir,
    ExpressaoRegular,
    FimPara,
    FormatacaoEscrita,
    Literal,
    Super,
    TipoDe,
    Tupla,
    Variavel,
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
import { AnalisadorSemanticoBase } from '../analisador-semantico-base';
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

export class AnalisadorSemanticoBirl extends AnalisadorSemanticoBase {
    pilhaVariaveis: PilhaVariaveis;
    variaveis: { [nomeVariavel: string]: VariavelHipoteticaBirlInterface };
    atual: number;
    diagnosticos: DiagnosticoAnalisadorSemantico[];

    constructor() {
        super();
        this.pilhaVariaveis = new PilhaVariaveis();
        this.variaveis = {};
        this.atual = 0;
        this.diagnosticos = [];
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

    visitarDeclaracaoVar(declaracao: Var): Promise<any> {
        this.variaveis[declaracao.simbolo.lexema] = {
            imutavel: false,
            tipo: 'número',
        };

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
        }

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
