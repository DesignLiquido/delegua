import {
    AcessoMetodo,
    AcessoMetodoOuPropriedade,
    Agrupamento,
    ArgumentoReferenciaFuncao,
    AjudaComoConstruto,
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
    Separador,
    TipoDe,
    Variavel,
    Vetor,
} from '../construtos';
import {
    Ajuda,
    Classe,
    Const,
    Declaracao,
    Enquanto,
    Escolha,
    Escreva,
    Expressao,
    Fazer,
    Falhar,
    FuncaoDeclaracao,
    ParaCada,
    Retorna,
    Se,
    Var,
} from '../declaracoes';
import { ParametroInterface, SimboloInterface } from '../interfaces';
import { DiagnosticoAnalisadorSemantico, DiagnosticoSeveridade } from '../interfaces/erros';
import { RetornoAnalisadorSemantico } from '../interfaces/retornos/retorno-analisador-semantico';
import { RetornoQuebra } from '../quebras';
import { buscarRetornos } from '../avaliador-sintatico/comum';
import { AnalisadorSemanticoBase } from './analisador-semantico-base';
import { EscopoVariavel } from './escopo-variavel';
import { FuncaoHipoteticaInterface } from './funcao-hipotetica-interface';
import { GerenciadorEscopos } from './gerenciador-escopos';
import { PilhaVariaveis } from './pilha-variaveis';

/**
 * O Analisador Semântico de Delégua.
 */
export class AnalisadorSemantico extends AnalisadorSemanticoBase {
    pilhaVariaveis: PilhaVariaveis;
    funcoes: { [nomeFuncao: string]: FuncaoHipoteticaInterface };
    classesDeclararadas: Set<string>;
    classesRegistradas: Map<string, Classe>;
    classeAtualEmAnalise: Classe | null;
    atual: number;
    diagnosticos: DiagnosticoAnalisadorSemantico[];

    constructor() {
        super();
        this.pilhaVariaveis = new PilhaVariaveis();
        this.gerenciadorEscopos = new GerenciadorEscopos();
        this.funcoes = {};
        this.classesDeclararadas = new Set<string>();
        this.classesRegistradas = new Map<string, Classe>();
        this.classeAtualEmAnalise = null;
        this.atual = 0;
        this.diagnosticos = [];
    }

    verificarTipoAtribuido(declaracao: Var | Const) {
        if (declaracao.tipo) {
            if (['vetor', 'qualquer[]', 'inteiro[]', 'texto[]'].includes(declaracao.tipo)) {
                if (declaracao.inicializador instanceof Vetor) {
                    const vetor = declaracao.inicializador as Vetor;
                    const vetorSemSeparadores = vetor.valores.filter(
                        (v) => v.constructor !== Separador
                    );

                    if (declaracao.tipo === 'inteiro[]') {
                        const apenasValores = vetorSemSeparadores.find(
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
                        const apenasValores = vetorSemSeparadores.find(
                            (v) => typeof v?.valor !== 'string'
                        );
                        if (apenasValores) {
                            this.erro(
                                declaracao.simbolo,
                                `Atribuição inválida para '${declaracao.simbolo.lexema}': é esperado um valor do tipo vetor de texto. Atual: ${vetor.tipo}.`
                            );
                        }
                    }
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

    private verificarTipoDe(valor: Construto): Promise<any> {
        switch (valor.constructor) {
            case Agrupamento:
                const valorAgrupamento = valor as Agrupamento;
                return this.verificarTipoDe(valorAgrupamento.expressao);
            case Binario:
                const valorBinario = valor as Binario;
                this.verificarTipoDe(valorBinario.direita);
                this.verificarTipoDe(valorBinario.esquerda);
                break;
            case Variavel:
                const valorVariavel = valor as Variavel;
                return this.verificarVariavel(valorVariavel);
        }

        return Promise.resolve();
    }

    visitarExpressaoFalhar(expressao: Falhar): Promise<any> {
        return this.verificarFalhar(expressao.explicacao);
    }

    private verificarFalhar(valor: Construto): Promise<any> {
        if (valor instanceof Binario) {
            this.verificarFalhar(valor.direita);
            this.verificarFalhar(valor.esquerda);
        }
        if (valor instanceof Agrupamento) {
            return this.verificarFalhar(valor.expressao);
        }
        if (valor instanceof Variavel) {
            return this.verificarVariavel(valor);
        }
        return Promise.resolve();
    }

    protected comparacaoArgumentosContraParametrosFuncao(
        simboloFuncao: SimboloInterface,
        parametros: ParametroInterface[],
        argumentos: Construto[]
    ) {
        if (parametros.length !== argumentos.length) {
            this.erro(
                simboloFuncao,
                `Função '${simboloFuncao.lexema}' espera ${parametros.length} parâmetros. Atual: ${argumentos.length}.`
            );
        }

        for (let [indice, parametro] of parametros.entries()) {
            // TODO: `argumento` pode ser Literal (tipo já resolvido) ou variável (tipo inferido em outra etapa).
            const argumento = argumentos[indice] as any;
            if (argumento) {
                if (parametro.tipoDado === 'texto' && argumento.tipo !== 'texto') {
                    this.erro(
                        simboloFuncao,
                        `O valor passado para o parâmetro '${parametro.nome.lexema}' (${parametro.tipoDado}) é diferente do esperado pela função (${argumento.tipo}).`
                    );
                } else if (['inteiro', 'número', 'real'].includes(parametro.tipoDado)) {
                    // Aqui, se houver diferença entre os tipos do parâmetro e do argumento, não há erro,
                    // porque Delégua pode trabalhar com conversões implícitas.
                    // Isso pode ou não mudar no futuro.
                    if (!['inteiro', 'número', 'real'].includes(argumento.tipo)) {
                        this.erro(
                            simboloFuncao,
                            `O valor passado para o parâmetro '${parametro.nome.lexema}' (${parametro.tipoDado}) é diferente do esperado pela função (${argumento.tipo}).`
                        );
                    }
                }
            }
        }
    }

    visitarChamadaPorArgumentoReferenciaFuncao(
        argumentoReferenciaFuncao: ArgumentoReferenciaFuncao,
        argumentos: Construto[]
    ) {
        const variavelCorrespondente: FuncaoConstruto =
            // this.variaveis[argumentoReferenciaFuncao.simboloFuncao.lexema].valor;
            this.gerenciadorEscopos.buscar(argumentoReferenciaFuncao.simboloFuncao.lexema)?.valor;
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
        const funcaoChamada =
            this.gerenciadorEscopos.buscar(variavel.simbolo.lexema) ||
            this.funcoes[variavel.simbolo.lexema];

        if (!funcaoChamada) {
            this.erro(
                entidadeChamadaVariavel.simbolo,
                `Chamada da função '${entidadeChamadaVariavel.simbolo.lexema}' não existe.`
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

    async visitarExpressaoDeChamada(expressao: Chamada) {
        for (const argumento of expressao.argumentos) {
            if (argumento instanceof Variavel) {
                this.gerenciadorEscopos.marcarComoUsada(argumento.simbolo.lexema);
            }
        }

        switch (expressao.entidadeChamada.constructor) {
            case AcessoMetodo:
                // Marca o objeto como usado quando seus métodos são chamados (ex: thor.corre())
                const entidadeChamadaAcessoMetodo = expressao.entidadeChamada as AcessoMetodo;
                this.marcarVariaveisUsadasEmExpressao(entidadeChamadaAcessoMetodo.objeto);
                break;
            case AcessoMetodoOuPropriedade:
                // Marca o objeto como usado quando seus métodos/propriedades são acessados (ex: thor.corre())
                // e verifica acesso a membros privados/protegidos
                const entidadeChamadaAcessoMetodoOuPropriedade =
                    expressao.entidadeChamada as AcessoMetodoOuPropriedade;
                this.marcarVariaveisUsadasEmExpressao(
                    entidadeChamadaAcessoMetodoOuPropriedade.objeto
                );
                await expressao.entidadeChamada.aceitar(this);
                break;
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

    visitarExpressaoDeAtribuicao(expressao: Atribuir) {
        let simboloAlvo: SimboloInterface;

        switch (expressao.alvo.constructor) {
            case Variavel:
                const alvoVariavel = expressao.alvo as Variavel;
                simboloAlvo = alvoVariavel.simbolo;
                break;
            default:
                return Promise.resolve();
        }

        const variavel = this.gerenciadorEscopos.buscar(simboloAlvo.lexema);

        if (!variavel) {
            this.erro(
                simboloAlvo,
                `Variável '${simboloAlvo.lexema}' ainda não foi declarada até este ponto.`
            );
            return Promise.resolve();
        }

        if (variavel.imutavel) {
            this.erro(simboloAlvo, `Constante '${simboloAlvo.lexema}' não pode ser modificada.`);
            return Promise.resolve();
        }

        // Marca como inicializada após atribuição
        this.gerenciadorEscopos.marcarComoInicializada(simboloAlvo.lexema, expressao.valor);

        // TODO: Readaptar para trabalhar com `expressao.alvo` sendo um construto.
        switch (expressao.alvo.constructor) {
            case Variavel:
                const alvoVariavel = expressao.alvo as Variavel;
                simboloAlvo = alvoVariavel.simbolo;
                break;
            default:
                // throw new Error(`Implementar atribuição para ${expressao.alvo.constructor}.`);
                return Promise.resolve();
        }

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
                let valoresSemSeparador = (expressao.valor as Vetor).valores.filter(
                    (v) => v.constructor !== Separador
                );
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

        /* if (valor.imutavel) {
            this.erro(simboloAlvo, `Constante ${simboloAlvo.lexema} não pode ser modificada.`);
            return Promise.resolve();
        } else {
            if (this.variaveis[simboloAlvo.lexema]) {
                this.variaveis[simboloAlvo.lexema].valor = expressao.valor;
            }
        } */
    }

    async visitarDeclaracaoDeExpressao(declaracao: Expressao): Promise<any> {
        return await declaracao.expressao.aceitar(this);
    }

    visitarDeclaracaoAjuda(declaracao: Ajuda): Promise<any> {
        if (declaracao.elemento) {
            this.marcarVariaveisUsadasEmExpressao(declaracao.elemento);
        }
        return Promise.resolve();
    }

    visitarExpressaoAjuda(expressao: AjudaComoConstruto): Promise<any> {
        if (expressao.valor) {
            this.marcarVariaveisUsadasEmExpressao(expressao.valor);
        }
        return Promise.resolve();
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

    override visitarDeclaracaoFazer(declaracao: Fazer) {
        // Marca variáveis usadas na condição
        this.marcarVariaveisUsadasEmExpressao(declaracao.condicaoEnquanto);
        // Verifica a condição
        return this.verificarCondicao(declaracao.condicaoEnquanto);
    }

    override visitarDeclaracaoParaCada(declaracao: ParaCada) {
        // Marca o vetor/dicionário como usado
        this.marcarVariaveisUsadasEmExpressao(declaracao.vetorOuDicionario);
        return Promise.resolve();
    }

    override visitarDeclaracaoSe(declaracao: Se) {
        // Marca variáveis usadas na condição
        this.marcarVariaveisUsadasEmExpressao(declaracao.condicao);
        // Verifica a condição (incluindo validação de tipos para operadores lógicos)
        return this.verificarCondicao(declaracao.condicao);
    }

    /**
     * Verifica uma expressão recursivamente, incluindo operações binárias
     */
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
        const tiposNumericos = ['inteiro', 'número', 'real'];

        // Verifica se algum operando é do tipo texto em operação aritmética
        if (tipoEsquerda === 'texto' || tipoDireita === 'texto') {
            // Verifica se é uma operação que precisa de números (não concatenação)
            const operadoresAritmeticos = ['SUBTRACAO', 'MULTIPLICACAO', 'DIVISAO', 'MODULO'];

            if (operadoresAritmeticos.includes(binario.operador.tipo)) {
                const ladoProblematico = tipoEsquerda === 'texto' ? 'esquerdo' : 'direito';
                const expressaoProblematica =
                    tipoEsquerda === 'texto' ? binario.esquerda : binario.direita;

                // Verifica se a expressão problemática é um Leia ou uma variável inicializada com Leia
                let mensagemAdicional = '';
                if (expressaoProblematica instanceof Leia) {
                    mensagemAdicional =
                        " Função 'leia()' retorna texto. Use 'inteiro(leia(...))' ou 'real(leia(...))' para converter.";
                } else if (expressaoProblematica instanceof Variavel) {
                    const variavel = this.gerenciadorEscopos.buscar(
                        (expressaoProblematica as Variavel).simbolo.lexema
                    );
                    if (variavel && variavel.valor instanceof Leia) {
                        mensagemAdicional =
                            " A variável foi inicializada com 'leia()' que retorna texto. Use 'inteiro(leia(...))' ou 'real(leia(...))' para converter.";
                    } else {
                        mensagemAdicional =
                            " Use 'inteiro(...)' ou 'real(...)' para converter texto em número.";
                    }
                }

                this.erro(
                    binario.operador,
                    `Operação aritmética com tipo incompatível: operando ${ladoProblematico} é do tipo 'texto', mas a operação requer número.${mensagemAdicional}`
                );
                return;
            }
        }

        if (tipoEsquerda && tipoDireita && tipoEsquerda !== tipoDireita) {
            // Verificar se são tipos numéricos compatíveis
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

                // Lista de funções built-in que não precisam ser declaradas
                const funcoesBuiltIn = [
                    'inteiro',
                    'real',
                    'número',
                    'texto',
                    'leia',
                    'escreva',
                    'tipo',
                ];

                // Classes/construtores geralmente começam com letra maiúscula
                const pareceSerClasse = nomeFuncao[0] === nomeFuncao[0].toUpperCase();

                // Só verifica se a função existe se não for built-in e não parecer ser classe
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
            const variavel = lado as Variavel;
            const variavelEscopo = this.gerenciadorEscopos.buscar(variavel.simbolo.lexema);

            if (variavelEscopo) {
                // Verifica se a variável tem um tipo definido
                if (
                    variavelEscopo.tipo &&
                    variavelEscopo.tipo !== 'lógico' &&
                    variavelEscopo.tipo !== 'qualquer'
                ) {
                    // Se a variável foi inicializada com um binário que resulta em 'lógico',
                    // consideramos que o lado é válido (caso como: var x = 5 > 2; enquanto (x) {...}).
                    if (
                        variavelEscopo.valor instanceof Binario &&
                        this.inferirTipoBinario(variavelEscopo.valor) === 'lógico'
                    ) {
                        return;
                    }

                    this.erro(
                        variavel.simbolo,
                        `Operador lógico requer operandos do tipo 'lógico', mas recebeu '${variavelEscopo.tipo}'.`
                    );
                }
            }
        }

        if (lado instanceof Logico) {
            this.verificarLogico(lado);
        }
    }

    /**
     * Verifica interpolações de texto e marca variáveis como usadas
     */
    protected verificarInterpolacaoTexto(texto: string, literal: Literal): void {
        // Regex para encontrar ${identificador}
        const regexInterpolacao = /\$\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;
        let match;

        while ((match = regexInterpolacao.exec(texto)) !== null) {
            const nomeVariavel = match[1];

            // Verifica se a variável existe
            const variavel = this.gerenciadorEscopos.buscar(nomeVariavel);
            const funcao = this.funcoes[nomeVariavel];

            if (!variavel && !funcao) {
                this.erro(
                    {
                        lexema: nomeVariavel,
                        tipo: 'IDENTIFICADOR',
                        linha: literal.linha,
                        hashArquivo: literal.hashArquivo,
                        literal: null,
                    } as SimboloInterface,
                    `Variável ou função '${nomeVariavel}' usada em interpolação não existe.`
                );
            } else if (variavel) {
                // Marca como usada
                this.gerenciadorEscopos.marcarComoUsada(nomeVariavel);

                // Verifica se foi inicializada
                if (!variavel.inicializada) {
                    this.aviso(
                        {
                            lexema: nomeVariavel,
                            tipo: 'IDENTIFICADOR',
                            linha: literal.linha,
                            hashArquivo: literal.hashArquivo,
                            literal: null,
                        } as SimboloInterface,
                        `Variável '${nomeVariavel}' usada em interpolação pode não ter sido inicializada.`
                    );
                }
            }
        }
    }

    override async visitarDeclaracaoEscreva(declaracao: Escreva): Promise<any> {
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

                if (possivelVariavel && possivelVariavel.valor === undefined) {
                    this.aviso(
                        argumento.simbolo,
                        `Variável '${argumento.simbolo.lexema}' não foi inicializada.`
                    );
                }
            } else if (!(argumento instanceof Literal)) {
                // Para expressões complexas (ex: AcessoMetodoOuPropriedade), delega ao visitante
                await argumento.aceitar(this);
            }
        }

        return Promise.resolve();
    }

    override visitarDeclaracaoConst(declaracao: Const): Promise<any> {
        this.verificarTipoAtribuido(declaracao);

        if (declaracao.inicializador) {
            this.marcarVariaveisUsadasEmExpressao(declaracao.inicializador);
            // Verifica operações binárias no inicializador
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
            // Verifica operações binárias no inicializador
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
                    // Valida tipo de retorno para funções anônimas atribuídas a variáveis
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

        // Inferir tipo do inicializador se não foi especificado explicitamente
        let tipoInferido = declaracao.tipo;
        if (!tipoInferido && declaracao.inicializador) {
            tipoInferido = this.obterTipoExpressao(declaracao.inicializador);
        }

        // Sugestão de tipo melhor quando 'qualquer' é usado explicitamente
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
                        colunaInicio: declaracao.simbolo.colunaInicio,
                        colunaFim: declaracao.simbolo.colunaFim,
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

    override visitarExpressaoRetornar(declaracao: Retorna): Promise<RetornoQuebra> {
        return Promise.resolve(null);
    }

    override visitarExpressaoDeVariavel(expressao: Variavel | Construto): Promise<any> {
        if (expressao instanceof Variavel) {
            return this.verificarVariavel(expressao);
        }

        return Promise.resolve();
    }

    protected override obterTipoExpressao(expressao: Construto): string | null {
        const tipoBase = super.obterTipoExpressao(expressao);
        if (tipoBase) return tipoBase;

        if (expressao instanceof Chamada && expressao.entidadeChamada instanceof Variavel) {
            const nomeCallee = (expressao.entidadeChamada as Variavel).simbolo.lexema;
            if (this.classesRegistradas.has(nomeCallee)) return nomeCallee;
        }
        return null;
    }

    private resolverTipoObjeto(objeto: Construto): string | null {
        if (objeto instanceof Variavel) {
            if (objeto.simbolo.lexema === 'isto' && this.classeAtualEmAnalise) {
                return this.classeAtualEmAnalise.simbolo.lexema;
            }
            return this.gerenciadorEscopos.buscar(objeto.simbolo.lexema)?.tipo ?? null;
        }
        if (objeto instanceof Chamada && objeto.entidadeChamada instanceof Variavel) {
            const nomeCallee = (objeto.entidadeChamada as Variavel).simbolo.lexema;
            if (this.classesRegistradas.has(nomeCallee)) return nomeCallee;
        }
        return null;
    }

    private estaEmClasseOuSubclasse(nomeClasse: string): boolean {
        const visitados = new Set<string>();
        const pilha: (Classe | null)[] = [this.classeAtualEmAnalise];
        while (pilha.length > 0) {
            const atual = pilha.pop();
            if (!atual) continue;
            if (visitados.has(atual.simbolo.lexema)) continue;
            visitados.add(atual.simbolo.lexema);
            if (atual.simbolo.lexema === nomeClasse) return true;
            for (const sc of atual.superClasses) {
                const pai = this.classesRegistradas.get(sc.simbolo.lexema) ?? null;
                if (pai) pilha.push(pai);
            }
        }
        return false;
    }

    override async visitarExpressaoAcessoMetodoOuPropriedade(
        expressao: AcessoMetodoOuPropriedade
    ): Promise<any> {
        const nomeMembro = expressao.simbolo.lexema;
        const tipoObjeto = this.resolverTipoObjeto(expressao.objeto);
        if (!tipoObjeto) return;

        const classeDef = this.classesRegistradas.get(tipoObjeto);
        if (!classeDef) return;

        const membro =
            classeDef.metodos.find((m) => m.simbolo.lexema === nomeMembro) ??
            classeDef.propriedades.find((p) => p.nome.lexema === nomeMembro);
        if (!membro) return;

        if (membro.acesso === 'privado') {
            if (this.classeAtualEmAnalise?.simbolo.lexema !== tipoObjeto) {
                this.erro(
                    expressao.simbolo,
                    `Membro '${nomeMembro}' é privado e não pode ser acessado fora da classe '${tipoObjeto}'.`
                );
            }
        } else if (membro.acesso === 'protegido') {
            if (!this.estaEmClasseOuSubclasse(tipoObjeto)) {
                this.erro(
                    expressao.simbolo,
                    `Membro '${nomeMembro}' é protegido e não pode ser acessado fora da hierarquia da classe '${tipoObjeto}'.`
                );
            }
        }
    }

    override async visitarDeclaracaoClasse(declaracao: Classe): Promise<any> {
        for (const superClasseVariavel of declaracao.superClasses) {
            const nomeSuperclasse: string = superClasseVariavel.simbolo.lexema;
            if (nomeSuperclasse === declaracao.simbolo.lexema) {
                this.erro(
                    superClasseVariavel.simbolo,
                    `A classe '${declaracao.simbolo.lexema}' não pode herdar de si mesma.`
                );
            } else if (!this.classesDeclararadas.has(nomeSuperclasse)) {
                this.erro(
                    superClasseVariavel.simbolo,
                    `Superclasse '${nomeSuperclasse}' não foi declarada.`
                );
            }
        }

        this.classesDeclararadas.add(declaracao.simbolo.lexema);
        this.classesRegistradas.set(declaracao.simbolo.lexema, declaracao);

        // Visita corpos dos métodos com contexto de classe ativo
        const classeAnterior = this.classeAtualEmAnalise;
        this.classeAtualEmAnalise = declaracao;
        for (const metodo of declaracao.metodos) {
            for (const stmt of metodo.funcao.corpo) {
                await stmt.aceitar(this);
            }
        }
        this.classeAtualEmAnalise = classeAnterior;
    }

    visitarDeclaracaoDefinicaoFuncao(declaracao: FuncaoDeclaracao): Promise<any> {
        if (declaracao.funcao.tipo === undefined) {
            this.erro(declaracao.simbolo, `Declaração de retorno da função é inválido.`);
        }

        if (declaracao.funcao.parametros.length >= 255) {
            this.erro(declaracao.simbolo, 'Função não pode ter mais de 255 parâmetros.');
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

            const retornos = declaracao.funcao.corpo.flatMap((c) => buscarRetornos(c));
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
                    d.simbolo.lexema === variavel.nome
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
        this.classesDeclararadas = new Set<string>();
        this.classesRegistradas = new Map<string, Classe>();
        this.classeAtualEmAnalise = null;
        this.atual = 0;
        this.diagnosticos = [];

        try {
            while (this.atual < declaracoes.length) {
                await declaracoes[this.atual].aceitar(this);
                this.atual++;
            }
        } catch (erro) {
            console.error('Erro durante análise semântica:', erro);
        }

        // Verifica variáveis não usadas ao final
        this.verificarVariaveisNaoUsadas();

        return {
            diagnosticos: this.diagnosticos,
        } as RetornoAnalisadorSemantico;
    }
}
