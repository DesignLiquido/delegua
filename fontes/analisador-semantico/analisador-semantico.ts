import { Agrupamento, Atribuir, Binario, Chamada, Construto, ExpressaoRegular, FimPara, FormatacaoEscrita, FuncaoConstruto, Literal, Logico, Super, TipoDe, Variavel, Vetor } from '../construtos';
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
    VarMultiplo,
} from '../declaracoes';
import { SimboloInterface } from '../interfaces';
import { AnalisadorSemanticoInterface } from '../interfaces/analisador-semantico-interface';
import { ErroAnalisadorSemantico } from '../interfaces/erros';
import { RetornoAnalisadorSemantico } from '../interfaces/retornos/retorno-analisador-semantico';
import { TiposDadosInterface } from '../interfaces/tipos-dados-interface';
import { ContinuarQuebra, RetornoQuebra, SustarQuebra } from '../quebras';
import { PilhaVariaveis } from './pilha-variaveis';

interface VariavelHipoteticaInterface {
    tipo: TiposDadosInterface;
    subtipo?: 'texto' | 'número' | 'inteiro' | 'longo' | 'lógico';
    imutavel: boolean;
    valor?: any
}

interface FuncaoHipoteticaInterface {
    valor: any
}

export class AnalisadorSemantico implements AnalisadorSemanticoInterface {
    pilhaVariaveis: PilhaVariaveis;
    variaveis: { [nomeVariavel: string]: VariavelHipoteticaInterface };
    funcoes: { [nomeFuncao: string]: FuncaoHipoteticaInterface }
    atual: number;
    erros: ErroAnalisadorSemantico[];

    constructor() {
        this.pilhaVariaveis = new PilhaVariaveis();
        this.variaveis = {};
        this.funcoes = {};
        this.atual = 0;
        this.erros = [];
    }
    visitarExpressaoExpressaoRegular(expressao: ExpressaoRegular): Promise<any> {
        return Promise.resolve();
    }

    erro(simbolo: SimboloInterface, mensagemDeErro: string): void {
        this.erros.push({
            simbolo: simbolo,
            mensagem: mensagemDeErro,
            hashArquivo: simbolo.hashArquivo,
            linha: simbolo.linha,
        });
    }

    verificarTipoAtribuido(declaracao: Var | Const) {
        if (declaracao.tipo) {
            if (['vetor', 'qualquer[]', 'inteiro[]', 'texto[]'].includes(declaracao.tipo)) {
                if (declaracao.inicializador instanceof Vetor) {
                    const vetor = declaracao.inicializador as Vetor;
                    if (declaracao.tipo === 'inteiro[]') {
                        const v = vetor.valores.find(v => typeof v?.valor !== 'number')
                        if (v) {
                            this.erro(
                                declaracao.simbolo,
                                `Atribuição inválida para '${declaracao.simbolo.lexema}', é esperado um vetor de 'inteiros' ou 'real'.`
                            );
                        }
                    }
                    if (declaracao.tipo === 'texto[]') {
                        const v = vetor.valores.find(v => typeof v?.valor !== 'string')
                        if (v) {
                            this.erro(
                                declaracao.simbolo,
                                `Atribuição inválida para '${declaracao.simbolo.lexema}', é esperado um vetor de 'texto'.`
                            );
                        }
                    }
                } else {
                    this.erro(declaracao.simbolo, `Atribuição inválida para '${declaracao.simbolo.lexema}', é esperado um vetor de elementos.`);
                }
            }
            if (declaracao.inicializador instanceof Literal) {
                const literal = declaracao.inicializador as Literal;
                if (declaracao.tipo === 'texto') {
                    if (typeof literal.valor !== 'string') {
                        this.erro(declaracao.simbolo, `Atribuição inválida para '${declaracao.simbolo.lexema}', é esperado um 'texto'.`);
                    }
                }
                if (['inteiro', 'real'].includes(declaracao.tipo)) {
                    if (typeof literal.valor !== 'number') {
                        this.erro(declaracao.simbolo, `Atribuição inválida para '${declaracao.simbolo.lexema}', é esperado um 'número'.`);
                    }
                }
            }
            if (declaracao.inicializador instanceof Leia) {
                if (declaracao.tipo !== 'texto') {
                    this.erro(declaracao.simbolo, `Atribuição inválida para '${declaracao.simbolo.lexema}', Leia só pode receber tipo 'texto'.`);
                }
            }
        }
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

    visitarExpressaoDeChamada(expressao: Chamada) {
        if (expressao.entidadeChamada instanceof Variavel) {
            const variavel = expressao.entidadeChamada as Variavel;
            const funcaoChamada = this.variaveis[variavel.simbolo.lexema] || this.funcoes[variavel.simbolo.lexema];
            if (!funcaoChamada) {
                this.erro(
                    expressao.entidadeChamada.simbolo,
                    `Chamada da função '${expressao.entidadeChamada.simbolo.lexema}' não existe.`
                );
                return Promise.resolve();
            }
            const funcao = funcaoChamada.valor as FuncaoConstruto;
            if (funcao.parametros.length !== expressao.argumentos.length) {
                this.erro(
                    expressao.entidadeChamada.simbolo,
                    `Função '${expressao.entidadeChamada.simbolo.lexema}' espera ${funcao.parametros.length} parametros.`
                );
            }

            for (let [indice, arg0] of funcao.parametros.entries()) {
                const arg1 = expressao.argumentos[indice];
                if (arg1) {
                    if (arg0.tipoDado?.tipo === 'texto' && typeof arg1.valor !== 'string') {
                        this.erro(
                            expressao.entidadeChamada.simbolo,
                            `O valor passado para o parâmetro '${arg0.tipoDado.nome}' é diferente do esperado pela função.`
                        );
                    }
                    else if (['inteiro', 'real'].includes(arg0.tipoDado?.tipo)
                        && typeof arg1.valor !== 'number') {
                        this.erro(
                            expressao.entidadeChamada.simbolo,
                            `O valor passado para o parâmetro '${arg0.tipoDado.nome}' é diferente do esperado pela função.`
                        );
                    }
                }
            }
        }

        return Promise.resolve();
    }

    visitarDeclaracaoDeAtribuicao(expressao: Atribuir) {
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
            if (expressao.valor instanceof Vetor) {
                let valores = (expressao.valor as Vetor).valores;
                if (!['qualquer[]'].includes(valor.tipo)) {
                    if (valor.tipo === 'texto[]') {
                        if (!valores.every((v) => typeof v.valor === 'string')) {
                            this.erro(expressao.simbolo, `Esperado tipo '${valor.tipo}' na atribuição.`);
                            return Promise.resolve();
                        }
                    }
                    if (['inteiro[]', 'numero[]'].includes(valor.tipo)) {
                        if (!valores.every((v) => typeof v.valor === 'number')) {
                            this.erro(expressao.simbolo, `Esperado tipo '${valor.tipo}' na atribuição.`);
                            return Promise.resolve();
                        }
                    }
                }
            }
        }

        if (valor.imutavel) {
            this.erro(expressao.simbolo, `Constante ${expressao.simbolo.lexema} não pode ser modificada.`);
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

    visitarExpressaoLeiaMultiplo(expressao: LeiaMultiplo) {
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
        const identificadorOuLiteral = declaracao.identificadorOuLiteral as any;
        const valor = this.variaveis[identificadorOuLiteral.simbolo?.lexema]?.valor;
        const tipo = typeof valor;
        for (let caminho of declaracao.caminhos) {
            for (let condicao of caminho.condicoes) {
                if (valor instanceof Leia && typeof condicao?.valor !== 'string') {
                    this.erro(condicao, `'caso ${condicao.valor}:' não é do mesmo tipo esperado em 'escolha'`);
                    continue;
                }
                if (!(valor instanceof Leia) && typeof condicao?.valor !== tipo) {
                    this.erro(condicao, `'caso ${condicao.valor}:' não é do mesmo tipo esperado em 'escolha'`);
                }
            }
        }

        return Promise.resolve();
    }

    visitarDeclaracaoTente(declaracao: Tente) {
        return Promise.resolve();
    }

    visitarDeclaracaoEnquanto(declaracao: Enquanto) {
        return this.verificarCondicao(declaracao.condicao);
    }

    private verificarCondicao(condicao: Construto): Promise<void> {
        if (condicao instanceof Variavel) {
            return this.verificarVariavel(condicao);
        }
        if (condicao instanceof Binario) {
            return this.verificarBinario(condicao);
        }
        if (condicao instanceof Agrupamento) {
            return this.verificarAgrupamento(condicao);
        }
        return Promise.resolve();
    }

    private verificarVariavel(variavel: Variavel): Promise<void> {
        const variavelHipotetica = this.variaveis[variavel.simbolo.lexema];
        if (!variavelHipotetica) {
            this.erro(
                variavel.simbolo,
                `Variável ${variavel.simbolo.lexema} ainda não foi declarada até este ponto.`
            );
        } else if (!(variavelHipotetica.valor instanceof Binario) && (typeof variavelHipotetica.valor !== 'boolean')) {
            this.erro(
                variavel.simbolo,
                `Esperado tipo 'lógico' na condição do 'enquanto'.`
            );
        }
        return Promise.resolve();
    }

    private verificarBinario(binario: Binario): Promise<void> {
        this.verificarLadoBinario(binario.direita);
        this.verificarLadoBinario(binario.esquerda);
        return Promise.resolve();
    }

    private verificarLadoBinario(lado: any): void {
        if (lado instanceof Variavel && !this.variaveis[lado.simbolo.lexema]) {
            this.erro(
                lado.simbolo,
                `Variável ${lado.simbolo.lexema} ainda não foi declarada até este ponto.`
            );
        }
    }

    private verificarAgrupamento(agrupamento: Agrupamento): Promise<void> {
        if (agrupamento.expressao instanceof Binario) {
            return this.verificarBinario(agrupamento.expressao);
        }
        if (agrupamento.expressao instanceof Logico) {
            this.verificarLadoLogico(agrupamento.expressao.direita);
            this.verificarLadoLogico(agrupamento.expressao.esquerda);
        }
        return Promise.resolve();
    }

    private verificarLadoLogico(lado: any): void {
        if (lado instanceof Variavel) {
            let variavel = lado as Variavel;
            this.verificarVariavel(variavel)
        }
    }


    visitarDeclaracaoImportar(declaracao: Importar) {
        return Promise.resolve();
    }

    visitarDeclaracaoEscreva(declaracao: Escreva) {
        const variaveis = declaracao.argumentos.filter(arg => arg instanceof Variavel)

        for (let variavel of variaveis as Variavel[]) {
            if (!this.variaveis[variavel.simbolo.lexema]) {
                this.erro(variavel.simbolo, `Variável '${variavel.simbolo.lexema}' não existe.`)
            }
        }

        return Promise.resolve();
    }

    visitarExpressaoEscrevaMesmaLinha(declaracao: EscrevaMesmaLinha) {
        return Promise.resolve();
    }

    visitarExpressaoBloco(declaracao: Bloco): Promise<any> {
        return Promise.resolve();
    }

    visitarDeclaracaoConst(declaracao: Const): Promise<any> {

        this.verificarTipoAtribuido(declaracao);

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
                tipo: declaracao.tipo,
                valor: declaracao.inicializador.valor
            };
        }

        return Promise.resolve();
    }

    visitarDeclaracaoConstMultiplo(declaracao: ConstMultiplo): Promise<any> {
        return Promise.resolve();
    }

    visitarDeclaracaoVar(declaracao: Var): Promise<any> {

        this.verificarTipoAtribuido(declaracao);

        if (declaracao.inicializador instanceof FuncaoConstruto) {
            const funcao = declaracao.inicializador;
            if (funcao.parametros.length >= 255) {
                this.erro(declaracao.simbolo, 'Não pode haver mais de 255 parâmetros');
            }
        }

        this.variaveis[declaracao.simbolo.lexema] = {
            imutavel: false,
            tipo: declaracao.tipo,
            valor: declaracao.inicializador?.valor || declaracao.inicializador
        };

        return Promise.resolve();
    }

    visitarDeclaracaoVarMultiplo(declaracao: VarMultiplo): Promise<any> {
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
        for (let parametro of declaracao.funcao.parametros) {
            if (parametro.hasOwnProperty('tipoDado') && !parametro.tipoDado.tipo) {
                this.erro(declaracao.simbolo, `O tipo '${parametro.tipoDado.tipoInvalido}' não é válido.`);
            }
        }

        if (declaracao.funcao.tipoRetorno === undefined) {
            this.erro(declaracao.simbolo, `Declaração de retorno da função é inválido.`);
        }

        if (declaracao.funcao.parametros.length >= 255) {
            this.erro(declaracao.simbolo, 'Não pode haver mais de 255 parâmetros');
        }

        let tipoRetornoFuncao = declaracao.funcao.tipoRetorno;
        if (tipoRetornoFuncao) {
            let funcaoContemRetorno = declaracao.funcao.corpo.find((c) => c instanceof Retorna) as Retorna;
            if (funcaoContemRetorno) {
                if (tipoRetornoFuncao === 'vazio') {
                    this.erro(declaracao.simbolo, `A função não pode ter nenhum tipo de retorno.`);
                }

                const tipoValor = typeof funcaoContemRetorno.valor.valor;
                if (!['qualquer'].includes(tipoRetornoFuncao)) {
                    if (tipoValor === 'string') {
                        if (tipoRetornoFuncao != 'texto') {
                            this.erro(
                                declaracao.simbolo,
                                `Esperado retorno do tipo '${tipoRetornoFuncao}' dentro da função.`
                            );
                        }
                    }
                    if (tipoValor === 'number') {
                        if (!['inteiro', 'real'].includes(tipoRetornoFuncao)) {
                            this.erro(
                                declaracao.simbolo,
                                `Esperado retorno do tipo '${tipoRetornoFuncao}' dentro da função.`
                            );
                        }
                    }
                }
            } else {
                if (tipoRetornoFuncao !== 'vazio') {
                    this.erro(declaracao.simbolo, `Esperado retorno do tipo '${tipoRetornoFuncao}' dentro da função.`);
                }
            }
        }

        this.funcoes[declaracao.simbolo.lexema] = {
            valor: declaracao.funcao
        }

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
