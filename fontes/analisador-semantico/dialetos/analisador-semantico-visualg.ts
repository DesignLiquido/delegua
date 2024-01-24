import { Atribuir, Chamada, ExpressaoRegular, FimPara, FormatacaoEscrita, FuncaoConstruto, Literal, Super, TipoDe, Variavel, Vetor } from "../../construtos";
import {
    Aleatorio,
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
        const { simbolo, valor } = expressao;
        let variavel = this.variaveis[simbolo.lexema];
        if (!variavel) {
            this.erro(
                simbolo,
                `Variável ${simbolo.lexema} ainda não foi declarada.`
            );
            return Promise.resolve();
        }


        if (variavel.tipo) {
            if (valor instanceof Literal && variavel.tipo.includes('[]')) {
                this.erro(simbolo, `Atribuição inválida, esperado tipo '${variavel.tipo}' na atribuição.`);
                return Promise.resolve();
            }
            if (valor instanceof Vetor && !variavel.tipo.includes('[]')) {
                this.erro(simbolo, `Atribuição inválida, esperado tipo '${variavel.tipo}' na atribuição.`);
                return Promise.resolve();
            }

            if (valor instanceof Literal) {
                let valorLiteral = typeof (valor as Literal).valor;
                if (!['qualquer'].includes(variavel.tipo)) {
                    if (valorLiteral === 'string') {
                        if (variavel.tipo != 'texto') {
                            this.erro(simbolo, `Esperado tipo '${variavel.tipo}' na atribuição.`);
                            return Promise.resolve();
                        }
                    }
                    if (valorLiteral === 'number') {
                        if (!['inteiro', 'real'].includes(variavel.tipo)) {
                            this.erro(simbolo, `Esperado tipo '${variavel.tipo}' na atribuição.`);
                            return Promise.resolve();
                        }
                    }
                }
            }
        }

        if (variavel) {
            this.variaveis[simbolo.lexema].valor = valor;
        }
    }


    private gerarNumeroAleatorio(min: number, max: number) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    private encontrarLeiaNoAleatorio(declaracao: Declaracao, menorNumero: number, maiorNumero: number) {
        if ('declaracoes' in declaracao) {
            // Se a declaração tiver um campo 'declaracoes', ela é um Bloco
            const declaracoes = declaracao.declaracoes as Declaracao[]
            for (const subDeclaracao of declaracoes) {
                this.encontrarLeiaNoAleatorio(subDeclaracao, menorNumero, maiorNumero);
            }
        } else if (declaracao instanceof Leia) {
            // Se encontrarmos um Leia, podemos efetuar as operações imediatamente
            for (const argumento of declaracao.argumentos) {
                this.atualizarVariavelComValorAleatorio(argumento as Variavel, menorNumero, maiorNumero);
            }
        }
    }

    private atualizarVariavelComValorAleatorio(variavel: Variavel, menorNumero: number, maiorNumero: number) {
        if (this.variaveis[variavel.simbolo.lexema]) {
            let valor: number | string = 0;
            if(this.variaveis[variavel.simbolo.lexema].tipo === "inteiro" || this.variaveis[variavel.simbolo.lexema].tipo === "real") valor = this.gerarNumeroAleatorio(menorNumero, maiorNumero);
            else if(this.variaveis[variavel.simbolo.lexema].tipo === "caracter" ) valor = this.palavraAleatoriaCom5Digitos()

            this.variaveis[variavel.simbolo.lexema].valor = valor;
        }
    }

    private palavraAleatoriaCom5Digitos(): string {
        const caracteres = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let palavra = "";

        for (let i = 0; i < 5; i++) {
            const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
            palavra += caracteres.charAt(indiceAleatorio);
        }

        return palavra;
    }

    visitarDeclaracaoAleatorio(declaracao: Aleatorio): Promise<any> {
        //Isso acontece quando não é informado os número máximos e mínimos
        let menorNumero = 0;
        let maiorNumero = 100

        if (declaracao.argumentos) {
            menorNumero = Math.min(declaracao.argumentos.min, declaracao.argumentos.max);
            maiorNumero = Math.max(declaracao.argumentos.min, declaracao.argumentos.max);

        }

        for (let corpoDeclaracao of declaracao.corpo.declaracoes) {
            this.encontrarLeiaNoAleatorio(corpoDeclaracao, menorNumero, maiorNumero);
        }

        return Promise.resolve();
    }

    visitarDeclaracaoVar(declaracao: Var): Promise<any> {
        this.variaveis[declaracao.simbolo.lexema] = {
            imutavel: false,
            tipo: declaracao.tipo,
            valor: declaracao.inicializador !== null ? declaracao.inicializador.valor !== undefined ? declaracao.inicializador.valor : declaracao.inicializador : undefined
        }
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
        for (let parametro of declaracao.funcao.parametros) {
            if (parametro.hasOwnProperty('tipoDado') && !parametro.tipoDado.tipo) {
                this.erro(declaracao.simbolo, `O tipo '${parametro.tipoDado.tipoInvalido}' não é valido`);
            }
        }

        if (declaracao.funcao.tipoRetorno === undefined) {
            this.erro(declaracao.simbolo, `Declaração de retorno da função é inválida`);
        }

        if (declaracao.funcao.parametros.length >= 255) {
            this.erro(declaracao.simbolo, 'Não pode haver mais de 255 parâmetros');
        }

        this.funcoes[declaracao.simbolo.lexema] = {
            valor: declaracao.funcao
        }

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
        if (expressao.entidadeChamada instanceof Variavel) {
            const variavel = expressao.entidadeChamada as Variavel;
            const funcaoChamada = this.variaveis[variavel.simbolo.lexema] || this.funcoes[variavel.simbolo.lexema]
            if (!funcaoChamada) {
                this.erro(
                    variavel.simbolo,
                    `Função '${variavel.simbolo.lexema} não foi declarada.'`
                )
                return Promise.resolve();
            }
            const funcao = funcaoChamada.valor as FuncaoConstruto;
            if (funcao.parametros.length != expressao.argumentos.length) {
                this.erro(
                    variavel.simbolo,
                    `Esperava ${funcao.parametros.length} ${funcao.parametros.length > 1 ? "argumentos" : "argumento"}, mas obteve ${expressao.argumentos.length}.`
                )
            }

            for (let [indice, arg0] of funcao.parametros.entries()) {
                const arg1 = expressao.argumentos[indice];
                if (arg1) {
                    if (arg0.tipoDado?.tipo.toLowerCase() === 'caracter' && typeof arg1.valor !== 'string') {
                        this.erro(
                            variavel.simbolo,
                            `O valor passado para o parâmetro '${arg0.tipoDado.nome}' é diferente do esperado pela função.`
                        );
                    }
                    else if (['inteiro', 'real'].includes(arg0.tipoDado?.tipo.toLowerCase())
                        && typeof arg1.valor !== 'number') {
                        this.erro(
                            variavel.simbolo,
                            `O valor passado para o parâmetro '${arg0.tipoDado.nome}' é diferente do esperado pela função.`
                        );
                    }
                }
            }
        }
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
    visitarExpressaoAcessoElementoMatriz(expressao: any) {
        return Promise.resolve()
    }

    visitarExpressaoAtribuicaoPorIndicesMatriz(expressao: any): Promise<any> {
        return Promise.resolve()
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
