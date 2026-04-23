import {
    AcessoMetodo,
    AcessoIntervaloVariavel,
    AcessoMetodoOuPropriedade,
    AcessoPropriedade,
    Agrupamento,
    ArgumentoReferenciaFuncao,
    Atribuir,
    Binario,
    Chamada,
    Construto,
    FormatacaoEscrita,
    FuncaoConstruto,
    Leia,
    Literal,
    Logico,
    ReferenciaFuncao,
    TipoDe,
    Variavel,
    Vetor,
    TuplaN,
    AcessoIndiceVariavel,
    Dupla,
} from '../../construtos';
import {
    Const,
    Declaracao,
    Enquanto,
    Escolha,
    Escreva,
    Expressao,
    Falhar,
    FuncaoDeclaracao,
    ParaCada,
    Retorna,
    Var,
} from '../../declaracoes';
import { SimboloInterface } from '../../interfaces';
import { DiagnosticoAnalisadorSemantico, DiagnosticoSeveridade } from '../../interfaces/erros';
import { RetornoAnalisadorSemantico } from '../../interfaces/retornos/retorno-analisador-semantico';
import { RetornoQuebra } from '../../quebras';
import { buscarRetornos } from '../../avaliador-sintatico/comum';
import { MicroAvaliadorSintaticoPitugues } from '../../avaliador-sintatico/dialetos/micro-avaliador-sintatico-pitugues';
import { MicroLexadorPitugues } from '../../lexador/micro-lexador-pitugues';
import { AnalisadorSemanticoBase } from '../analisador-semantico-base';
import { EscopoVariavel } from '../escopo-variavel';
import { FuncaoHipoteticaInterface } from '../funcao-hipotetica-interface';
import { GerenciadorEscopos } from '../gerenciador-escopos';
import { PilhaVariaveis } from '../pilha-variaveis';

const FUNCOES_NATIVAS_PITUGUES = [
    'aleatorio',
    'aleatorio_entre',
    'algum',
    'arredondar',
    'encontrar',
    'encontrar_indice',
    'encontrar_ultimo',
    'encontrar_ultimo_indice',
    'filtrar_por',
    'incluido',
    'inteiro',
    'intervalo',
    'enumerar',
    'mapear',
    'maximo',
    'minimo',
    'numero',
    'número',
    'ordenar',
    'para_cada',
    'primeiro_em_condicao',
    'real',
    'reduzir',
    'somar',
    'tamanho',
    'texto',
    'todos',
    'todos_em_condicao',
    'tupla',
    'vetor',
    'leia',
    'escreva',
    'tipo',
];

/**
 * O Analisador Semântico de Pituguês.
 */
export class AnalisadorSemanticoPitugues extends AnalisadorSemanticoBase {
    pilhaVariaveis: PilhaVariaveis;
    funcoes: { [nomeFuncao: string]: FuncaoHipoteticaInterface };
    atual: number;
    diagnosticos: DiagnosticoAnalisadorSemantico[];
    protected readonly microLexador = new MicroLexadorPitugues();
    protected readonly microAvaliadorSintatico = new MicroAvaliadorSintaticoPitugues();

    constructor() {
        super();
        this.pilhaVariaveis = new PilhaVariaveis();
        this.gerenciadorEscopos = new GerenciadorEscopos();
        this.funcoes = {};
        this.atual = 0;
        this.diagnosticos = [];
    }

    /**
     * Marca as variáveis usadas em uma expressão.
     * Versão estendida da classe base com tratamento adicional de construtos Pituguês.
     */
    protected override marcarVariaveisUsadasEmExpressao(expressao: Construto): void {
        if (expressao instanceof Variavel) {
            this.gerenciadorEscopos.marcarComoUsada(expressao.simbolo.lexema);
            return;
        }

        if (expressao instanceof Atribuir) {
            // Em atribuições, marca variáveis usadas no valor (lado direito)
            this.marcarVariaveisUsadasEmExpressao(expressao.valor);
            return;
        }

        if (expressao instanceof Binario) {
            this.marcarVariaveisUsadasEmExpressao(expressao.esquerda);
            this.marcarVariaveisUsadasEmExpressao(expressao.direita);
            return;
        }

        if (expressao instanceof Agrupamento) {
            this.marcarVariaveisUsadasEmExpressao(expressao.expressao);
            return;
        }

        if (expressao instanceof Logico) {
            this.marcarVariaveisUsadasEmExpressao(expressao.esquerda);
            this.marcarVariaveisUsadasEmExpressao(expressao.direita);
            return;
        }

        if (expressao instanceof Chamada) {
            // Marca a entidade sendo chamada (pode ser Variavel, AcessoMetodo, etc.)
            this.marcarVariaveisUsadasEmExpressao(expressao.entidadeChamada);

            // Marca todos os argumentos
            for (const argumento of expressao.argumentos) {
                this.marcarVariaveisUsadasEmExpressao(argumento);
            }
            return;
        }

        if (
            expressao instanceof AcessoMetodo ||
            expressao instanceof AcessoMetodoOuPropriedade ||
            expressao instanceof AcessoPropriedade
        ) {
            this.marcarVariaveisUsadasEmExpressao((expressao as any).objeto);
            return;
        }

        // Chama a classe base para outros tipos (Unario, AcessoIndiceVariavel, etc.)
        super.marcarVariaveisUsadasEmExpressao(expressao);
    }

    verificarTipoAtribuido(declaracao: Var | Const): void {
        if (declaracao.tipo) {
            if (['vetor', 'qualquer[]', 'inteiro[]', 'texto[]'].includes(declaracao.tipo)) {
                if (declaracao.inicializador instanceof Vetor) {
                    const vetor = declaracao.inicializador as Vetor;
                    const vetorSemSeparadores: Construto[] = vetor.elementos;

                    if (declaracao.tipo === 'inteiro[]') {
                        const apenasValores: Construto | undefined = vetorSemSeparadores.find(
                            (v) => typeof v?.valor !== 'number'
                        );
                        if (apenasValores) {
                            this.erro(
                                declaracao.simbolo,
                                `Atribuição inválida para '${declaracao.simbolo.lexema}': é esperado um valor do tipo vetor de inteiro ou real. Atual: ${vetor.tipo}.`
                            );
                        }
                    }
                    if (declaracao.tipo === 'texto[]') {
                        const apenasValores: Construto | undefined = vetorSemSeparadores.find(
                            (v) => typeof v?.valor !== 'string'
                        );
                        if (apenasValores) {
                            this.erro(
                                declaracao.simbolo,
                                `Atribuição inválida para '${declaracao.simbolo.lexema}': é esperado um valor do tipo vetor de texto. Atual: ${vetor.tipo}.`
                            );
                        }
                    }
                } else if (declaracao.inicializador instanceof Chamada) {
                    // Chamadas de método/função podem retornar vetores, então não geramos erro
                    // A verificação de tipo será feita em tempo de execução
                } else {
                    this.erro(
                        declaracao.simbolo,
                        `Atribuição inválida para '${declaracao.simbolo.lexema}': é esperado um vetor de elementos.`
                    );
                }
            }
            if (declaracao.inicializador instanceof Literal) {
                const literal = declaracao.inicializador as Literal;
                if (declaracao.tipo === 'texto' && literal.tipo !== 'texto') {
                    this.erro(
                        declaracao.simbolo,
                        `Atribuição inválida para '${declaracao.simbolo.lexema}': é esperado um valor do tipo texto. Atual: ${literal.tipo}.`
                    );
                }
                if (
                    ['inteiro', 'número', 'real'].includes(declaracao.tipo) &&
                    !['inteiro', 'número', 'real'].includes(literal.tipo)
                ) {
                    this.erro(
                        declaracao.simbolo,
                        `Atribuição inválida para '${declaracao.simbolo.lexema}': é esperado um valor do tipo número. Atual: ${literal.tipo}.`
                    );
                }
            }

            if (declaracao.inicializador instanceof Leia) {
                if (!['qualquer', 'texto'].includes(declaracao.tipo)) {
                    this.erro(
                        declaracao.simbolo,
                        `Atribuição inválida para '${declaracao.simbolo.lexema}', Função 'leia()' sempre retorna 'texto'.`
                    );
                }
            }
        }
    }

    visitarExpressaoTipoDe(expressao: TipoDe): Promise<any> {
        return this.verificarTipoDe(expressao.valor);
    }

    private async verificarTipoDe(valor: Construto): Promise<any> {
        switch (valor.constructor) {
            case Agrupamento:
                const valorAgrupamento = valor as Agrupamento;
                return await this.verificarTipoDe(valorAgrupamento.expressao);
            case Binario:
                const valorBinario = valor as Binario;
                await this.verificarTipoDe(valorBinario.direita);
                await this.verificarTipoDe(valorBinario.esquerda);
                break;
            case Variavel:
                const valorVariavel = valor as Variavel;
                return await this.verificarVariavel(valorVariavel);
        }

        return Promise.resolve();
    }

    async visitarExpressaoFalhar(expressao: Falhar): Promise<any> {
        return await this.verificarFalhar(expressao.explicacao);
    }

    private async verificarFalhar(valor: Construto): Promise<any> {
        if (valor instanceof Binario) {
            await this.verificarFalhar(valor.direita);
            await this.verificarFalhar(valor.esquerda);
        }
        if (valor instanceof Agrupamento) {
            return await this.verificarFalhar(valor.expressao);
        }
        if (valor instanceof Variavel) {
            return await this.verificarVariavel(valor);
        }

        return Promise.resolve();
    }

    visitarChamadaPorArgumentoReferenciaFuncao(
        argumentoReferenciaFuncao: ArgumentoReferenciaFuncao,
        argumentos: Construto[]
    ) {
        const variavelCorrespondente: FuncaoConstruto = this.gerenciadorEscopos.buscar(
            argumentoReferenciaFuncao.simboloFuncao.lexema
        )?.valor;

        if (!variavelCorrespondente) {
            return;
        }

        this.comparacaoArgumentosContraParametrosFuncao(
            argumentoReferenciaFuncao.simboloFuncao,
            variavelCorrespondente.parametros,
            argumentos
        );
    }

    visitarChamadaPorReferenciaFuncao(referenciaFuncao: ReferenciaFuncao, argumentos: Construto[]) {
        const funcaoCorrespondente: FuncaoHipoteticaInterface =
            this.funcoes[referenciaFuncao.simboloFuncao.lexema];
        if (!funcaoCorrespondente) {
            return;
        }

        this.comparacaoArgumentosContraParametrosFuncao(
            referenciaFuncao.simboloFuncao,
            funcaoCorrespondente.valor.parametros,
            argumentos
        );
    }

    visitarChamadaPorVariavel(entidadeChamadaVariavel: Variavel, argumentos: Construto[]) {
        const variavel = entidadeChamadaVariavel as Variavel;
        const nomeFuncao = variavel.simbolo.lexema;
        const funcoesNativas = FUNCOES_NATIVAS_PITUGUES;
        const pareceSerClasse = nomeFuncao[0] === nomeFuncao[0].toUpperCase();

        if (funcoesNativas.includes(nomeFuncao) || pareceSerClasse) {
            return Promise.resolve();
        }

        const funcaoChamada =
            this.gerenciadorEscopos.buscar(nomeFuncao) || this.funcoes[nomeFuncao];

        if (!funcaoChamada) {
            this.erro(
                entidadeChamadaVariavel.simbolo,
                `Chamada da função '${nomeFuncao}' não existe.`
            );
            return Promise.resolve();
        }

        const funcao = funcaoChamada.valor as FuncaoConstruto;
        this.comparacaoArgumentosContraParametrosFuncao(
            entidadeChamadaVariavel.simbolo,
            funcao.parametros,
            argumentos
        );
    }

    visitarExpressaoDeChamada(expressao: Chamada) {
        this.marcarVariaveisUsadasEmExpressao(expressao.entidadeChamada);

        // Garante que toda a árvore de argumentos seja validada e marcada como usada.
        for (const argumento of expressao.argumentos) {
            this.marcarVariaveisUsadasEmExpressao(argumento);
            this.verificarExpressao(argumento);
        }

        switch (expressao.entidadeChamada.constructor) {
            case ArgumentoReferenciaFuncao:
                const entidadeChamadaArgumentoReferenciaFuncao =
                    expressao.entidadeChamada as ArgumentoReferenciaFuncao;
                this.visitarChamadaPorArgumentoReferenciaFuncao(
                    entidadeChamadaArgumentoReferenciaFuncao,
                    expressao.argumentos
                );
                break;
            case ReferenciaFuncao:
                const entidadeChamadaReferenciaFuncao =
                    expressao.entidadeChamada as ReferenciaFuncao;
                this.visitarChamadaPorReferenciaFuncao(
                    entidadeChamadaReferenciaFuncao,
                    expressao.argumentos
                );
                break;
            case Variavel:
                const entidadeChamadaVariavel = expressao.entidadeChamada as Variavel;
                this.visitarChamadaPorVariavel(entidadeChamadaVariavel, expressao.argumentos);
                break;
        }

        return Promise.resolve();
    }

    private resolverSimboloAlvoAtribuicao(alvo: Construto): SimboloInterface | undefined {
        let atual: Construto | undefined = alvo;

        while (atual) {
            if (atual instanceof Variavel) {
                return atual.simbolo;
            }

            if (atual instanceof Agrupamento) {
                atual = atual.expressao;
                continue;
            }

            if (atual instanceof AcessoIndiceVariavel) {
                atual = atual.entidadeChamada;
                continue;
            }

            if (
                atual instanceof AcessoMetodo ||
                atual instanceof AcessoMetodoOuPropriedade ||
                atual instanceof AcessoPropriedade
            ) {
                atual = (atual as any).objeto;
                continue;
            }

            const simbolo = (atual as any)?.simbolo;
            if (simbolo?.lexema) {
                return simbolo as SimboloInterface;
            }

            return undefined;
        }

        return undefined;
    }

    override visitarExpressaoDeAtribuicao(expressao: Atribuir) {
        const simboloAlvo = this.resolverSimboloAlvoAtribuicao(expressao.alvo);
        if (!simboloAlvo) {
            return Promise.resolve();
        }

        // Marca variáveis usadas no valor da atribuição
        this.marcarVariaveisUsadasEmExpressao(expressao.valor);

        let variavel = this.gerenciadorEscopos.buscar(simboloAlvo.lexema);

        if (!variavel) {
            // Em Pituguês (como Python), atribuições criam variáveis se não existirem
            let valorInicializador: any = undefined;
            if (expressao.valor.hasOwnProperty('valor')) {
                valorInicializador = (expressao.valor as any).valor;
            } else {
                valorInicializador = expressao.valor;
            }

            this.gerenciadorEscopos.declarar(simboloAlvo.lexema, {
                nome: simboloAlvo.lexema,
                tipo: 'qualquer',
                imutavel: false,
                valor: valorInicializador,
                inicializada: true,
                usada: false,
                hashArquivo: simboloAlvo.hashArquivo,
                linha: simboloAlvo.linha,
            });
            return Promise.resolve();
        }

        // Marca como inicializada após atribuição
        this.gerenciadorEscopos.marcarComoInicializada(simboloAlvo.lexema, expressao.valor);

        let valor = this.gerenciadorEscopos.buscar(simboloAlvo.lexema);
        if (!valor) {
            this.erro(
                simboloAlvo,
                `Variável ${simboloAlvo.lexema} ainda não foi declarada até este ponto.`
            );
            return Promise.resolve();
        }

        if (valor.tipo) {
            if (expressao.valor instanceof Literal && valor.tipo.includes('[]')) {
                this.erro(
                    simboloAlvo,
                    `Atribuição inválida, esperado tipo '${valor.tipo}' na atribuição.`
                );
                return Promise.resolve();
            }
            if (expressao.valor instanceof Vetor && !valor.tipo.includes('[]')) {
                this.erro(
                    simboloAlvo,
                    `Atribuição inválida, esperado tipo '${valor.tipo}' na atribuição.`
                );
                return Promise.resolve();
            }

            if (expressao.valor instanceof Literal) {
                let valorLiteral = typeof (expressao.valor as Literal).valor;
                if (!['qualquer'].includes(valor.tipo)) {
                    if (valorLiteral === 'string') {
                        if (valor.tipo != 'texto') {
                            this.erro(simboloAlvo, `Esperado tipo '${valor.tipo}' na atribuição.`);
                            return Promise.resolve();
                        }
                    }
                    if (valorLiteral === 'number') {
                        if (!['inteiro', 'número', 'real'].includes(valor.tipo)) {
                            this.erro(simboloAlvo, `Esperado tipo '${valor.tipo}' na atribuição.`);
                            return Promise.resolve();
                        }
                    }
                }
            }
            if (expressao.valor instanceof Vetor) {
                let valoresSemSeparador = (expressao.valor as Vetor).elementos;
                if (!['qualquer[]'].includes(valor.tipo)) {
                    if (valor.tipo === 'texto[]') {
                        if (!valoresSemSeparador.every((v) => typeof v.valor === 'string')) {
                            this.erro(simboloAlvo, `Esperado tipo '${valor.tipo}' na atribuição.`);
                            return Promise.resolve();
                        }
                    }
                    if (['inteiro[]', 'numero[]'].includes(valor.tipo)) {
                        if (!valoresSemSeparador.every((v) => typeof v.valor === 'number')) {
                            this.erro(simboloAlvo, `Esperado tipo '${valor.tipo}' na atribuição.`);
                            return Promise.resolve();
                        }
                    }
                }
            }
        }

        return Promise.resolve();
    }

    override async visitarDeclaracaoDeExpressao(declaracao: Expressao): Promise<any> {
        return await declaracao.expressao.aceitar(this);
    }

    override visitarDeclaracaoEscolha(declaracao: Escolha) {
        const identificadorOuLiteral = declaracao.identificadorOuLiteral as Construto;
        const tipo = identificadorOuLiteral.tipo;

        for (let caminho of declaracao.caminhos) {
            for (let condicao of caminho.condicoes) {
                switch (condicao.constructor) {
                    case Literal:
                        const condicaoLiteral = condicao as Literal;

                        if (condicaoLiteral.tipo !== tipo) {
                            this.erro(
                                {
                                    lexema: condicaoLiteral.valor,
                                    tipo: condicaoLiteral.tipo,
                                    linha: condicaoLiteral.linha,
                                    hashArquivo: condicaoLiteral.hashArquivo,
                                } as SimboloInterface,
                                `'caso ${condicaoLiteral.valor}:' não é do mesmo tipo esperado em 'escolha' (esperado: ${tipo}, atual: ${condicaoLiteral.tipo}).`
                            );
                        }
                        break;
                    case Variavel:
                        const condicaoVariavel = condicao as Variavel;
                        this.verificarVariavel(condicaoVariavel);
                        const variavelHipotetica = this.gerenciadorEscopos.buscar(
                            condicaoVariavel.simbolo.lexema
                        );
                        if (variavelHipotetica && typeof variavelHipotetica.valor !== tipo) {
                            this.erro(
                                condicaoVariavel.simbolo,
                                `'caso ${condicaoVariavel.simbolo.lexema}:' não é do mesmo tipo esperado em 'escolha'`
                            );
                        }
                        break;
                }
            }
        }

        return Promise.resolve();
    }

    override visitarDeclaracaoEnquanto(declaracao: Enquanto) {
        return this.verificarCondicao(declaracao.condicao);
    }

    override async visitarDeclaracaoParaCada(declaracao: ParaCada) {
        this.marcarVariaveisUsadasEmExpressao(declaracao.vetorOuDicionario);

        if (declaracao.vetorOuDicionario) {
            await declaracao.vetorOuDicionario.aceitar(this);
        }

        this.gerenciadorEscopos.empilharEscopo();

        try {
            if (declaracao.variavelIteracao) {
                if (declaracao.variavelIteracao instanceof Variavel) {
                    const nomeVariavel = declaracao.variavelIteracao.simbolo.lexema;

                    this.gerenciadorEscopos.declarar(nomeVariavel, {
                        nome: nomeVariavel,
                        tipo: 'qualquer',
                        imutavel: false,
                        valor: null,
                        inicializada: true,
                        usada: false,
                        hashArquivo: declaracao.hashArquivo,
                        linha: declaracao.linha,
                    });
                } else if (declaracao.variavelIteracao instanceof Dupla) {
                    const dupla = declaracao.variavelIteracao;

                    const primeiraVariavel = dupla.primeiro;
                    const segundaVariavel = dupla.segundo;

                    if (primeiraVariavel instanceof Variavel) {
                        const nome = primeiraVariavel.simbolo.lexema;
                        this.gerenciadorEscopos.declarar(nome, {
                            nome,
                            tipo: 'qualquer',
                            imutavel: false,
                            valor: null,
                            inicializada: true,
                            usada: false,
                            hashArquivo: declaracao.hashArquivo,
                            linha: declaracao.linha,
                        });
                    }

                    if (segundaVariavel instanceof Variavel) {
                        const nome = segundaVariavel.simbolo.lexema;
                        this.gerenciadorEscopos.declarar(nome, {
                            nome,
                            tipo: 'qualquer',
                            imutavel: false,
                            valor: null,
                            inicializada: true,
                            usada: false,
                            hashArquivo: declaracao.hashArquivo,
                            linha: declaracao.linha,
                        });
                    }
                }
            }

            if (declaracao.corpo) {
                if (Array.isArray(declaracao.corpo)) {
                    for (const instrucao of declaracao.corpo) {
                        await instrucao.aceitar(this);
                    }
                } else if ((declaracao.corpo as any).declaracoes) {
                    for (const instrucao of (declaracao.corpo as any).declaracoes) {
                        await instrucao.aceitar(this);
                    }
                } else {
                    await declaracao.corpo.aceitar(this);
                }
            }
        } finally {
            this.gerenciadorEscopos.desempilharEscopo();
        }

        return Promise.resolve();
    }

    private verificarCondicao(condicao: Construto): Promise<void> {
        if (condicao instanceof Agrupamento) {
            return this.verificarCondicao(condicao.expressao);
        }

        if (condicao instanceof Variavel) {
            return this.verificarVariavelBinaria(condicao);
        }

        if (condicao instanceof Binario) {
            return this.verificarBinario(condicao);
        }

        if (condicao instanceof Logico) {
            return this.verificarLogico(condicao);
        }

        if (condicao instanceof Chamada) {
            return this.verificarChamada(condicao);
        }

        return Promise.resolve();
    }

    private verificarVariavelBinaria(variavel: Variavel): Promise<void> {
        this.verificarVariavel(variavel);
        const variavelHipotetica = this.gerenciadorEscopos.buscar(variavel.simbolo.lexema);
        if (
            variavelHipotetica &&
            !(variavelHipotetica.valor instanceof Binario) &&
            typeof variavelHipotetica.valor !== 'boolean'
        ) {
            this.erro(variavel.simbolo, `Esperado tipo 'lógico' na condição do 'enquanto'.`);
        }
        return Promise.resolve();
    }

    private verificarVariavel(variavel: Variavel): Promise<void> {
        const variavelEscopo = this.gerenciadorEscopos.buscar(variavel.simbolo.lexema);

        if (!variavelEscopo) {
            this.erro(
                variavel.simbolo,
                `Variável '${variavel.simbolo.lexema}' ainda não foi declarada até este ponto.`
            );
            return Promise.resolve();
        }

        // Marca como usada
        this.gerenciadorEscopos.marcarComoUsada(variavel.simbolo.lexema);

        // Verifica se foi inicializada
        if (!variavelEscopo.inicializada) {
            this.aviso(
                variavel.simbolo,
                `Variável '${variavel.simbolo.lexema}' pode não ter sido inicializada antes do uso.`
            );
        }

        return Promise.resolve();
    }

    private verificarExpressao(expressao: Construto): void {
        if (expressao instanceof Agrupamento) {
            this.verificarExpressao(expressao.expressao);
            return;
        }

        if (expressao instanceof Binario) {
            this.verificarBinario(expressao);
            return;
        }

        if (expressao instanceof Logico) {
            this.verificarLogico(expressao);
            return;
        }

        if (expressao instanceof Chamada) {
            this.verificarChamada(expressao);
            return;
        }

        if (expressao instanceof Variavel) {
            this.verificarVariavel(expressao);
            return;
        }
    }

    private verificarBinario(binario: Binario): Promise<void> {
        this.verificarExistenciaConstruto(binario.direita);
        this.verificarExistenciaConstruto(binario.esquerda);
        this.verificarOperadorBinario(binario);
        return Promise.resolve();
    }

    private verificarOperadorBinario(binario: Binario): void {
        if (binario.esquerda instanceof Binario) {
            this.verificarOperadorBinario(binario.esquerda);
        }

        if (binario.direita instanceof Binario) {
            this.verificarOperadorBinario(binario.direita);
        }

        const operadoresMatematicos = ['ADICAO', 'SUBTRACAO', 'MULTIPLICACAO', 'DIVISAO', 'MODULO'];

        if (operadoresMatematicos.includes(binario.operador.tipo)) {
            this.verificarTiposOperandos(binario);
        }

        if (binario.operador.tipo === 'DIVISAO') {
            this.verificarDivisaoPorZero(binario);
        }
    }

    /**
     * Verifica se os tipos dos operandos são compatíveis
     */
    private verificarTiposOperandos(binario: Binario): void {
        const tipoEsquerda = this.obterTipoExpressao(binario.esquerda);
        const tipoDireita = this.obterTipoExpressao(binario.direita);

        if (tipoEsquerda && tipoDireita && tipoEsquerda !== tipoDireita) {
            // Verificar se são tipos numéricos compatíveis
            const tiposNumericos = ['inteiro', 'número', 'real'];
            const ambosNumericos =
                tiposNumericos.includes(tipoEsquerda) && tiposNumericos.includes(tipoDireita);

            if (!ambosNumericos) {
                this.aviso(
                    binario.operador,
                    `Operação entre tipos diferentes: tipo esquerdo '${tipoEsquerda}' e tipo direito '${tipoDireita}'. O resultado será resolvido implicitamente.`
                );
            }
        }
    }

    /**
     * Verifica divisão por zero recursivamente
     */
    private verificarDivisaoPorZero(binario: Binario): void {
        const valorDireita = this.avaliarExpressaoConstante(binario.direita);

        if (valorDireita === 0) {
            this.erro(binario.operador, `Divisão por zero.`);
        }
    }

    /**
     * Tenta avaliar uma expressão em tempo de compilação para detectar valores constantes
     * Retorna o valor se puder ser determinado, ou null caso contrário
     */
    private avaliarExpressaoConstante(expressao: Construto): any {
        if (expressao instanceof Literal) {
            return expressao.valor;
        }

        if (expressao instanceof Variavel) {
            const variavel = this.gerenciadorEscopos.buscar(expressao.simbolo.lexema);

            if (!variavel) {
                return null;
            }

            if (variavel.imutavel && variavel.inicializada) {
                return variavel.valor;
            }

            if (variavel.inicializada && variavel.valor !== undefined) {
                return variavel.valor;
            }

            return null;
        }

        if (expressao instanceof Binario) {
            const esquerda = this.avaliarExpressaoConstante(expressao.esquerda);
            const direita = this.avaliarExpressaoConstante(expressao.direita);

            if (esquerda !== null && direita !== null) {
                return this.calcularOperacaoBinaria(expressao.operador.tipo, esquerda, direita);
            }
        }

        if (expressao instanceof Agrupamento) {
            return this.avaliarExpressaoConstante(expressao.expressao);
        }

        return null;
    }

    /**
     * Calcula o resultado de uma operação binária em tempo de compilação
     */
    private calcularOperacaoBinaria(operador: string, esquerda: any, direita: any): any {
        try {
            switch (operador) {
                case 'ADICAO':
                    return esquerda + direita;
                case 'SUBTRACAO':
                    return esquerda - direita;
                case 'MULTIPLICACAO':
                    return esquerda * direita;
                case 'DIVISAO':
                    return esquerda / direita;
                case 'MODULO':
                    return esquerda % direita;
                case 'MAIOR':
                    return esquerda > direita;
                case 'MAIOR_IGUAL':
                    return esquerda >= direita;
                case 'MENOR':
                    return esquerda < direita;
                case 'MENOR_IGUAL':
                    return esquerda <= direita;
                case 'IGUAL':
                    return esquerda === direita;
                case 'DIFERENTE':
                    return esquerda !== direita;
                default:
                    return null;
            }
        } catch (e) {
            return null;
        }
    }

    /**
     * Obtém o tipo de uma expressão (pode ser Literal, Variavel, ou Binario)
     */
    override obterTipoExpressao(expressao: Construto): string | null {
        if (expressao instanceof Literal) {
            return expressao.tipo;
        }

        if (expressao instanceof Variavel) {
            const variavel = this.gerenciadorEscopos.buscar(expressao.simbolo.lexema);
            return variavel?.tipo || null;
        }

        if (expressao instanceof Binario) {
            // Para binários, tentamos inferir o tipo baseado nos operandos
            return this.inferirTipoBinario(expressao);
        }

        if (expressao instanceof Agrupamento) {
            return this.obterTipoExpressao(expressao.expressao);
        }

        return null;
    }

    /**
     * Infere o tipo de resultado de uma operação binária
     */
    protected inferirTipoBinario(binario: Binario): string | null {
        const tipoEsquerda = this.obterTipoExpressao(binario.esquerda);
        const tipoDireita = this.obterTipoExpressao(binario.direita);

        if (!tipoEsquerda || !tipoDireita) {
            return null;
        }

        const operadoresMatematicos = ['ADICAO', 'SUBTRACAO', 'MULTIPLICACAO', 'DIVISAO', 'MODULO'];
        const operadoresComparacao = [
            'MAIOR',
            'MAIOR_IGUAL',
            'MENOR',
            'MENOR_IGUAL',
            'IGUAL',
            'DIFERENTE',
        ];

        if (operadoresComparacao.includes(binario.operador.tipo)) {
            return 'lógico';
        }

        if (operadoresMatematicos.includes(binario.operador.tipo)) {
            const tiposNumericos = ['inteiro', 'número', 'real'];
            if (tiposNumericos.includes(tipoEsquerda) && tiposNumericos.includes(tipoDireita)) {
                // Se um dos lados é 'real', o resultado é 'real'
                if (tipoEsquerda === 'real' || tipoDireita === 'real') {
                    return 'real';
                }

                return 'número';
            }

            // Concatenação de textos
            if (tipoEsquerda === 'texto' || tipoDireita === 'texto') {
                return 'texto';
            }
        }

        return 'qualquer';
    }

    private verificarExistenciaConstruto(construto: Construto): void {
        if (construto instanceof Variavel) {
            if (!this.gerenciadorEscopos.buscar(construto.simbolo.lexema)) {
                this.erro(
                    construto.simbolo,
                    `Variável ${construto.simbolo.lexema} ainda não foi declarada até este ponto.`
                );
                return;
            }

            this.gerenciadorEscopos.marcarComoUsada(construto.simbolo.lexema);
            return;
        }

        if (construto instanceof Binario) {
            this.verificarBinario(construto);
        }
    }

    private verificarLogico(logico: Logico): Promise<void> {
        this.verificarLadoLogico(logico.direita);
        this.verificarLadoLogico(logico.esquerda);
        return Promise.resolve();
    }

    private verificarChamada(chamada: Chamada): Promise<void> {
        switch (chamada.entidadeChamada.constructor) {
            case Variavel:
                let entidadeChamadaVariavel = chamada.entidadeChamada as Variavel;
                const nomeFuncao = entidadeChamadaVariavel.simbolo.lexema;
                const funcoesBuiltIn = FUNCOES_NATIVAS_PITUGUES;

                const pareceSerClasse = nomeFuncao[0] === nomeFuncao[0].toUpperCase();

                if (
                    !funcoesBuiltIn.includes(nomeFuncao) &&
                    !pareceSerClasse &&
                    !this.funcoes[nomeFuncao] &&
                    !this.gerenciadorEscopos.buscar(nomeFuncao)
                ) {
                    this.erro(
                        entidadeChamadaVariavel.simbolo,
                        `Chamada da função '${nomeFuncao}' não existe.`
                    );
                }
                break;
        }

        return Promise.resolve();
    }

    private verificarLadoLogico(lado: Construto): void {
        if (lado instanceof Variavel) {
            let variavel = lado as Variavel;
            this.verificarVariavelBinaria(variavel);
        }
    }

    /**
     * Verifica interpolações de texto e marca variáveis como usadas,
     * compreendendo cada expressão interpolada com MicroLexadorPitugues e MicroAvaliadorSintaticoPitugues.
     */
    protected override verificarInterpolacaoTexto(texto: string, literal: Literal): void {
        const regexInterpolacao = /\$\{(.*?)\}/g;
        let match;

        while ((match = regexInterpolacao.exec(texto)) !== null) {
            const expressaoInterpolacao = match[1].trim();
            try {
                const retornoMicroLexador = this.microLexador.mapear(expressaoInterpolacao);
                const retornoMicro = this.microAvaliadorSintatico.analisar(
                    retornoMicroLexador,
                    literal.linha
                );
                for (const construto of retornoMicro.declaracoes) {
                    this.marcarVariaveisUsadasEmExpressao(construto as unknown as Construto);
                }
            } catch (_) {
                // Erros de sintaxe na interpolação são tratados em tempo de execução
            }
        }
    }

    override visitarDeclaracaoEscreva(declaracao: Escreva) {
        if (declaracao.argumentos.length === 0) {
            const { linha, hashArquivo } = declaracao;
            const simbolo: SimboloInterface<''> = {
                literal: '',
                tipo: '',
                lexema: 'escreva',
                linha,
                hashArquivo,
            };
            this.erro(simbolo, `É preciso ter um ou mais parametros para 'escreva(...)'`);
            return Promise.resolve();
        }

        for (const argumento of declaracao.argumentos) {
            this.marcarVariaveisUsadasEmExpressao(argumento);

            if (argumento instanceof Literal && argumento.tipo === 'texto') {
                this.verificarInterpolacaoTexto(String(argumento.valor), argumento);
            }

            if (argumento instanceof Variavel) {
                const possivelVariavel = this.gerenciadorEscopos.buscar(argumento.simbolo.lexema);
                const possivelFuncao = this.funcoes[argumento.simbolo.lexema];

                if (!possivelVariavel && !possivelFuncao) {
                    this.erro(
                        argumento.simbolo,
                        `Variável ou função '${argumento.simbolo.lexema}' não existe.`
                    );
                    continue;
                }

                if (possivelVariavel && !possivelVariavel.inicializada) {
                    this.aviso(
                        argumento.simbolo,
                        `Variável '${argumento.simbolo.lexema}' não foi inicializada.`
                    );
                }
            }
        }

        return Promise.resolve();
    }

    override visitarDeclaracaoConst(declaracao: Const): Promise<any> {
        this.verificarTipoAtribuido(declaracao);

        if (declaracao.inicializador) {
            this.marcarVariaveisUsadasEmExpressao(declaracao.inicializador);
            this.verificarExpressao(declaracao.inicializador);
        }

        const constanteCorrespondente = this.gerenciadorEscopos.buscarNoEscopoAtual(
            declaracao.simbolo.lexema
        );

        if (constanteCorrespondente) {
            this.erro(declaracao.simbolo, 'Declaração de constante já feita.');
            return Promise.resolve();
        }

        this.gerenciadorEscopos.declarar(declaracao.simbolo.lexema, {
            nome: declaracao.simbolo.lexema,
            tipo: declaracao.tipo || 'qualquer',
            imutavel: true,
            valor: declaracao.inicializador?.valor,
            inicializada: true,
            usada: false,
            hashArquivo: declaracao.simbolo.hashArquivo,
            linha: declaracao.simbolo.linha,
        });

        // TODO: Verificar inicializador.

        return Promise.resolve();
    }

    override visitarDeclaracaoVar(declaracao: Var): Promise<any> {
        this.verificarTipoAtribuido(declaracao);

        if (declaracao.inicializador) {
            this.marcarVariaveisUsadasEmExpressao(declaracao.inicializador);
            this.verificarExpressao(declaracao.inicializador);

            switch (declaracao.inicializador.constructor) {
                case FuncaoConstruto:
                    const funcaoConstruto = declaracao.inicializador as FuncaoConstruto;
                    if (funcaoConstruto.parametros.length >= 255) {
                        this.erro(
                            declaracao.simbolo,
                            'Função não pode ter mais de 255 parâmetros.'
                        );
                    }
                    if (funcaoConstruto.tipo) {
                        const tipoRetornoFuncao = funcaoConstruto.tipo;
                        if (!['vazio', 'qualquer'].includes(tipoRetornoFuncao)) {
                            const todosOsCaminhosRetornam = this.todosOsCaminhosRetornam(
                                funcaoConstruto.corpo
                            );

                            if (!todosOsCaminhosRetornam) {
                                this.erro(
                                    declaracao.simbolo,
                                    `Função '${declaracao.simbolo.lexema}' deve retornar '${tipoRetornoFuncao}' em todos os caminhos de execução.`
                                );
                            }

                            const funcaoContemRetorno = funcaoConstruto.corpo.find(
                                (c) => c instanceof Retorna
                            ) as Retorna;

                            if (funcaoContemRetorno && funcaoContemRetorno.valor) {
                                const tipoValor = typeof funcaoContemRetorno.valor.valor;
                                if (!['qualquer'].includes(tipoRetornoFuncao)) {
                                    if (tipoValor === 'string' && tipoRetornoFuncao !== 'texto') {
                                        this.erro(
                                            declaracao.simbolo,
                                            `Esperado retorno do tipo '${tipoRetornoFuncao}' dentro da função.`
                                        );
                                    }
                                    if (
                                        tipoValor === 'number' &&
                                        !['inteiro', 'real', 'número'].includes(tipoRetornoFuncao)
                                    ) {
                                        this.erro(
                                            declaracao.simbolo,
                                            `Esperado retorno do tipo '${tipoRetornoFuncao}' dentro da função.`
                                        );
                                    }
                                }
                            }
                        }
                    }
                    break;
            }
        }

        let valorInicializador: any = undefined;
        if (declaracao.inicializador) {
            if (declaracao.inicializador.hasOwnProperty('valor')) {
                valorInicializador = (declaracao.inicializador as any).valor;
            } else {
                valorInicializador = declaracao.inicializador;
            }
        }

        let tipoInferido = declaracao.tipo;
        // Se o tipo é o padrão implícito 'qualquer', tenta inferir um tipo mais específico
        // a partir do inicializador. Para 'qualquer' explícito, apenas sugerimos mais abaixo.
        if (tipoInferido === 'qualquer' && !declaracao.tipoExplicito && declaracao.inicializador) {
            const tipoObtido = this.obterTipoExpressao(declaracao.inicializador);
            if (tipoObtido) {
                tipoInferido = tipoObtido;
            }
        }

        if (
            declaracao.tipoExplicito &&
            declaracao.tipoOriginal === 'qualquer' &&
            declaracao.inicializador
        ) {
            const tipoMelhor = this.obterTipoExpressao(declaracao.inicializador);
            if (tipoMelhor && tipoMelhor !== 'qualquer') {
                this.sugestao(declaracao.simbolo, 'Um tipo melhor pode ser inferido.', [
                    {
                        titulo: `Alterar tipo para '${tipoMelhor}'`,
                        textoOriginal: 'qualquer',
                        textoSubstituto: tipoMelhor,
                        linha: declaracao.simbolo.linha,
                        colunaInicio: declaracao.simbolo.colunaInicio ?? -1,
                        colunaFim: declaracao.simbolo.colunaFim ?? -1,
                    },
                ]);
            }
        }

        const variavel: EscopoVariavel = {
            nome: declaracao.simbolo.lexema,
            tipo: tipoInferido || 'qualquer',
            imutavel: false,
            valor: valorInicializador,
            inicializada:
                declaracao.inicializador !== null && declaracao.inicializador !== undefined,
            usada: false,
            hashArquivo: declaracao.simbolo.hashArquivo,
            linha: declaracao.simbolo.linha,
        };

        const declaradaComSucesso = this.gerenciadorEscopos.declarar(
            declaracao.simbolo.lexema,
            variavel
        );

        if (!declaradaComSucesso) {
            const variavelExistente = this.gerenciadorEscopos.buscarNoEscopoAtual(
                declaracao.simbolo.lexema
            );

            this.aviso(
                declaracao.simbolo,
                `Variável '${declaracao.simbolo.lexema}' já foi declarada na linha ${variavelExistente?.linha}.`
            );
        }

        return Promise.resolve();
    }

    override visitarExpressaoFormatacaoEscrita(expressao: FormatacaoEscrita): Promise<any> {
        if (expressao.expressao) {
            /* for (const expressao of expressao.expressoes) {
                if (expressao instanceof Variavel) {
                    this.gerenciadorEscopos.marcarComoUsada(expressao.simbolo.lexema);
                }
                // Recursively check for variables in more complex expressions
                this.marcarVariaveisUsadasEmExpressao(expressao);
            } */
        }

        return Promise.resolve();
    }

    private verificarBinarioEmExpressao(expressao: Construto): void {
        if (expressao instanceof Agrupamento) {
            this.verificarBinarioEmExpressao(expressao.expressao);
            return;
        }
        if (expressao instanceof Binario) {
            this.verificarOperadorBinario(expressao);
        }
    }

    override visitarExpressaoRetornar(declaracao: Retorna): Promise<RetornoQuebra> {
        if (declaracao.valor) {
            this.verificarBinarioEmExpressao(declaracao.valor);
        }
        return Promise.resolve(null as any);
    }

    override visitarExpressaoDeVariavel(expressao: Variavel | Construto): Promise<any> {
        if (expressao instanceof Variavel) {
            return this.verificarVariavel(expressao);
        }

        return Promise.resolve();
    }

    override async visitarExpressaoAcessoIntervaloVariavel(
        expressao: AcessoIntervaloVariavel
    ): Promise<any> {
        const expressaoIntervalo = expressao as any;

        await expressaoIntervalo.objeto.aceitar(this);

        if (expressaoIntervalo.inicio) {
            await expressaoIntervalo.inicio.aceitar(this);
        }

        if (expressaoIntervalo.fim) {
            await expressaoIntervalo.fim.aceitar(this);
        }

        return Promise.resolve();
    }

    async visitarExpressaoTuplaN(expressao: TuplaN): Promise<any> {
        for (let i = 0; i < expressao.elementos.length; i++) {
            await expressao.elementos[i].aceitar(this);
        }
        return Promise.resolve();
    }

    visitarDeclaracaoDefinicaoFuncao(declaracao: FuncaoDeclaracao): Promise<any> {
        if (declaracao.funcao.parametros.length >= 255) {
            this.erro(declaracao.simbolo, 'Função não pode ter mais de 255 parâmetros.');
        }

        const todosRetornos = declaracao.funcao.corpo.reduce(
            (acc: any[], c) => acc.concat(buscarRetornos(c)),
            []
        );
        for (const instrucao of todosRetornos) {
            if (instrucao.valor) {
                this.verificarBinarioEmExpressao(instrucao.valor);
            }
        }

        let tipoRetornoFuncao = declaracao.funcao.tipo;
        if (tipoRetornoFuncao) {
            if (!['vazio', 'qualquer'].includes(tipoRetornoFuncao)) {
                const todosOsCaminhosRetornam = this.todosOsCaminhosRetornam(
                    declaracao.funcao.corpo
                );

                if (!todosOsCaminhosRetornam) {
                    this.erro(
                        declaracao.simbolo,
                        `Função '${declaracao.simbolo.lexema}' deve retornar '${tipoRetornoFuncao}' em todos os caminhos de execução.`
                    );
                }
            }

            const retornos = declaracao.funcao.corpo.reduce(
                (acc: any[], c) => acc.concat(buscarRetornos(c)),
                []
            );
            // Filtra retornos com tipo 'qualquer' (não determinado em tempo de análise sintática)
            const retornosComTipoIndeterminado = retornos.filter(
                (retorno) =>
                    retorno.valor !== null &&
                    retorno.valor !== undefined &&
                    retorno.tipo === 'qualquer'
            );

            // Se a função é 'vazio' e há retornos com tipo indeterminado,
            // tenta inferir o tipo e fornece mensagem útil ao desenvolvedor
            if (
                tipoRetornoFuncao === 'vazio' &&
                declaracao.funcao.tipoExplicito &&
                retornosComTipoIndeterminado.length > 0
            ) {
                const retornoComValor = retornosComTipoIndeterminado[0];
                const tipoInferido = this.obterTipoExpressao(retornoComValor.valor);

                if (tipoInferido && tipoInferido !== 'qualquer') {
                    this.erro(
                        declaracao.simbolo,
                        `A função não pode ter nenhum tipo de retorno. Tipo inferido do retorno: '${tipoInferido}'.`
                    );
                } else {
                    this.erro(declaracao.simbolo, `A função não pode ter nenhum tipo de retorno.`);
                }
            } else {
                // Verifica tipos de retorno para funções não-vazio
                const retornoComValor = retornos.find(
                    (retorno) => retorno.valor !== null && retorno.valor !== undefined
                );

                if (retornoComValor) {
                    const tipoValor = typeof retornoComValor.valor?.valor;
                    if (!['qualquer'].includes(tipoRetornoFuncao)) {
                        if (tipoValor === 'string' && tipoRetornoFuncao !== 'texto') {
                            this.erro(
                                declaracao.simbolo,
                                `Esperado retorno do tipo '${tipoRetornoFuncao}' dentro da função.`
                            );
                        }
                        if (
                            tipoValor === 'number' &&
                            !['inteiro', 'real', 'número'].includes(tipoRetornoFuncao)
                        ) {
                            this.erro(
                                declaracao.simbolo,
                                `Esperado retorno do tipo '${tipoRetornoFuncao}' dentro da função.`
                            );
                        }
                    }
                }
            }
        }

        this.funcoes[declaracao.simbolo.lexema] = {
            valor: declaracao.funcao,
        };

        return Promise.resolve();
    }

    verificarVariaveisNaoUsadas(): void {
        const naoUsadas = this.gerenciadorEscopos.obterVariaveisNaoUsadas();

        for (let variavel of naoUsadas) {
            // Verifica se já existe um erro associado à variável.
            const temErro = this.diagnosticos.some(
                (d) =>
                    d.severidade === DiagnosticoSeveridade.ERRO &&
                    d.simbolo?.lexema === variavel.nome
            );

            // Se a variável já tem um erro associado, não emitir aviso de não usada.
            if (temErro) {
                continue;
            }

            this.aviso(
                {
                    lexema: variavel.nome,
                    linha: variavel.linha,
                    tipo: variavel.tipo,
                    hashArquivo: variavel.hashArquivo,
                } as SimboloInterface,
                `Variável '${variavel.nome}' foi declarada mas nunca usada.`
            );
        }
    }

    async analisar(declaracoes: Declaracao[]): Promise<RetornoAnalisadorSemantico> {
        this.gerenciadorEscopos = new GerenciadorEscopos();
        this.funcoes = {};
        this.atual = 0;
        this.diagnosticos = [];

        while (this.atual < declaracoes.length) {
            await declaracoes[this.atual].aceitar(this);
            this.atual++;
        }

        // Verifica variáveis não usadas ao final
        this.verificarVariaveisNaoUsadas();

        return {
            diagnosticos: this.diagnosticos,
        } as RetornoAnalisadorSemantico;
    }
}
